export const INITIAL_PLACES = [
  {
  id: 1,
  name: "신촌 낭만오지",
  address: "서울 마포구 고산길 17",
  screenType: "빔프로젝터",
  naverMapUrl: "https://naver.me/5r9z7UxJ"
},

{
  id: 2,
  name: "신촌 썬더치킨",
  address: "서울 서대문구 연세로11길 20 1층",
  screenType: "빔프로젝터",
  naverMapUrl: "https://naver.me/FTXDlTC9"
},
{
  id: 3,
  name: "신촌 뉴타운",
  address: "서울 서대문구 연세로12길 27",
  screenType: "TV 다수",
  naverMapUrl: "https://naver.me/IGJyfK7B"
},

{
  id: 4,
  name: "홍대 만선호프",
  address: "서울 마포구 와우산로17길 15 1층, 2층",
  screenType: "빔프로젝터",
  naverMapUrl: "https://naver.me/xq3drtjR"
},

{
  id: 5,
  name: "신촌 오퍼스",
  address: "서울 서대문구 연세로7길 18 2층",
  screenType: "빔프로젝터",
  naverMapUrl: "https://naver.me/Gipd4Lqn"
  }
];

export const CATEGORY_DETAILS = {
  all: { label: '전체', color: 'bg-zinc-800 text-zinc-100' },
  pub: { label: '스포츠 펍', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' },
  chicken: { label: '치킨집/호프', color: 'bg-amber-950/80 text-amber-300 border-amber-500/30' },
  plaza: { label: '야외 응원', color: 'bg-red-950/80 text-red-300 border-red-500/30' },
  cinema: { label: '대형 스크린', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30' },
  lounge: { label: '라운지/루프탑', color: 'bg-purple-950/80 text-purple-300 border-purple-500/30' },
};

export const CROWD_DETAILS = {
  critical: { label: '🔥 포화 (인원수 폭발)', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
  high: { label: '🍺 북적임 (스탠딩/만석)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  moderate: { label: '✨ 여유 (즐거운 분위기)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
  chill: { label: '👤 차분 (조용한 분석파)', color: 'text-sky-500 bg-sky-500/10 border-sky-500/30' },
};

export const REGIONS = [
  { value: 'all', label: '전체 서울' },
  { value: 'gwanghwamun', label: '광화문/종로' },
  { value: 'hongdae', label: '홍대/신촌' },
  { value: 'gangnam', label: '강남/역삼' },
  { value: 'itaewon', label: '이태원/용산' },
  { value: 'jamsil', label: '잠실/송파' }
];

export const ATMOSPHERE_TAGS_POOL = [
  '미친 응원 분위기',
  '붉은악마 공식응원',
  '축덕 많음',
  '대형 스크린 3개',
  '초대형 전광판',
  '영국 펍 바이브',
  '치맥의 성지',
  '소리 질러도 안 혼남',
  '루프탑 응원',
  '힙한 바이브',
  '외국어 응원',
  '조용하게 보기 가능',
  '혼자가도 안 어색',
  '웅장한 사운드',
  '에어컨 빵빵',
  '사장님이 국가대표 팬',
  '400인치 LED 대형',
  '예약 필수',
  '동네 축덕 아지트',
  '맥덕들 추천'
],
