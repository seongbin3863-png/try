/**
 * Converts Seoul general Geographic Latitude and Longitude into 
 * standard 2D vector percentage positions (x: 0-100, y: 0-100) mapped onto the custom Seoul map asset.
 */
export function convertLatLngToXY(lat, lng) {
  // Approximate boundary box of the custom Seoul dark map
  const minLat = 37.47;  // Southernmost bounds (near Gangnam south/Gwanak)
  const maxLat = 37.60;  // Northernmost bounds (near Eunpyeong/Dobong)
  const minLng = 126.85; // Westernmost bounds (near Gimpo/Gangseo/Hongdae west)
  const maxLng = 127.14; // Easternmost bounds (near Gangdong/Songpa/Jamsil east)

  // Longitude corresponds to horizontal progression: West (0) to East (100)
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  
  // Latitude corresponds to vertical progression.
  // In screen space coordinates, 0% is top (North) and 100% is bottom (South).
  const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

  return {
    x: Math.max(8, Math.min(92, parseFloat(x.toFixed(2)))),
    y: Math.max(8, Math.min(92, parseFloat(y.toFixed(2))))
  };
}

/**
 * Parses a CSV string into active Place items
 */
export function parseCSVToPlaces(csvText) {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quote-escaped values in CSV elegantly
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    const rowValues = matches ? matches.map(v => v.replace(/^"|"$/g, '').trim()) : line.split(',');

    if (rowValues.length < 3) continue;

    const entry = {};
    headers.forEach((header, index) => {
      if (index < rowValues.length) {
        entry[header] = rowValues[index];
      }
    });

    // Translate dynamic properties to Place schema
    const name = entry.name || entry.placename || entry.title || '이름 없는 응원 장소';
    const lat = parseFloat(entry.lat || entry.latitude || '37.55');
    const lng = parseFloat(entry.lng || entry.longitude || entry.long || '126.93');
    const description = entry.description || entry.desc || '서포터즈 응원전이 기획된 장소입니다.';
    const originalImage = entry.image || entry.imageurl || entry.img || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80';
    
    // Fallback to cute cheering image if local mock URL is given
    const imageUrl = originalImage.startsWith('/') 
      ? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80'
      : originalImage;

    const screen_size = entry.screen_size || entry.screensize || entry.screen || '대형 스크린 확보';
    const solo_friendly = String(entry.solo_friendly || entry.solofriendly || 'true').toLowerCase() === 'true';
    const reservation_required = String(entry.reservation_required || entry.reservationrequired || 'false').toLowerCase() === 'true';
    
    // Parse atmosphere tags (can be comma-separated or JSON style list)
    const rawAtmosphere = entry.atmosphere || entry.tags || entry.atmospheretags || '';
    let atmosphereTags = ['신나는 분위기', '붉은악마 응원'];
    if (rawAtmosphere) {
      atmosphereTags = rawAtmosphere.split(/[/|;,-]/).map(tag => tag.trim()).filter(Boolean);
    }

    const crowd_level = entry.crowd_level || entry.crowdlevel || 'moderate';
    let crowdLevel = 'moderate';
    if (['critical', '5', 'highest', 'max'].includes(String(crowd_level).toLowerCase())) crowdLevel = 'critical';
    else if (['high', '4', 'busy'].includes(String(crowd_level).toLowerCase())) crowdLevel = 'high';
    else if (['chill', '1', 'quiet'].includes(String(crowd_level).toLowerCase())) crowdLevel = 'chill';

    const address = entry.address || entry.location || '서울 특별시 마포구 신촌로';

    results.push({
      name,
      latitude: lat,
      longitude: lng,
      description,
      imageUrl,
      screenSize: screen_size,
      soloFriendly: solo_friendly,
      reservationRequired: reservation_required,
      atmosphereTags: atmosphereTags.slice(0, 5),
      crowdLevel,
      address
    });
  }

  return results;
}

/**
 * Validates and converts custom parsed entries to real Place scheme
 */
export function validateAndMapToPlace(raw, index) {
  const { x, y } = convertLatLngToXY(raw.latitude || 37.55, raw.longitude || 126.93);
  
  // Detect Region based on geographic coordinate proximity
  let region = 'hongdae';
  let regionLabel = '홍대/신촌';

  const lat = raw.latitude || 37.55;
  const lng = raw.longitude || 126.93;

  // Gwanghwamun: High Lat (north), Mid Lng
  if (lat > 37.565 && lng < 127.01 && lng > 126.95) {
    region = 'gwanghwamun';
    regionLabel = '광화문/종로';
  } // Gangnam: Low Lat (south), East Lng
  else if (lat < 37.52 && lng > 127.01) {
    region = 'gangnam';
    regionLabel = '강남/역삼';
  } // Jamsil: Mid-Low Lat, Far East Lng
  else if (lng > 127.06) {
    region = 'jamsil';
    regionLabel = '잠실/송파';
  } // Itaewon: Mid Lat (center), Mid Lng
  else if (lat < 37.545 && lat > 37.51 && lng > 126.96 && lng < 127.01) {
    region = 'itaewon';
    regionLabel = '이태원/용산';
  }

  const categoryLabelMap = {
    pub: '스포츠 펍',
    chicken: '치킨집/호프',
    plaza: '야외 응원',
    cinema: '대형 스크린',
    lounge: '라운지/루프탑'
  };

  const crowdLabels = {
    critical: '🔥 현시각 인원 포화 (야외 스탠딩 발생)',
    high: '🍺 북적북적 (합석 필수)',
    moderate: '✨ 여유로움 (시원한 공간)',
    chill: '👤 한적함 (차분한 관람)'
  };

  const randInt = Math.floor(Math.random() * 20) + 75; // 75 ~ 95% random cheer
  const crowd = raw.crowdLevel || 'moderate';

  return {
    id: `uploaded-${Date.now()}-${index}`,
    name: raw.name || '업로드 응원 장소',
    category: raw.category || 'pub',
    categoryLabel: categoryLabelMap[raw.category] || '요리주점',
    address: raw.address || '서울특별시 마포구 어울마당로',
    region,
    regionLabel,
    latitude: lat,
    longitude: lng,
    x,
    y,
    imageUrl: raw.imageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    atmosphereTags: raw.atmosphereTags || ['미친 응원 분위기', '대형 스크린'],
    crowdLevel: crowd,
    crowdLabel: crowdLabels[crowd] || '✨ 여유로움',
    cheerIntensity: raw.cheerIntensity || randInt,
    screenSize: raw.screenSize || '150인치 대형 스크린',
    reservationRequired: !!raw.reservationRequired,
    soloFriendly: raw.soloFriendly !== false,
    instagramUrl: raw.instagramUrl || 'https://instagram.com',
    naverMapUrl: raw.naverMapUrl || 'https://map.naver.com',
    description: raw.description || '축구 경기를 전방향 고출력 스피커로 관람하며 소리를 지르고 소통할 수 있는 프리미엄 공간입니다.',
    realtimeReactions: raw.realtimeReactions || {
      fireCount: Math.floor(Math.random() * 50) + 10,
      cheerCount: Math.floor(Math.random() * 100) + 20,
      noSeatCount: Math.floor(Math.random() * 10),
      goingCount: Math.floor(Math.random() * 80) + 15
    },
    approved: true,
    createdAt: new Date().toISOString()
  };
}
