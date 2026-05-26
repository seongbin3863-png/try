export const INITIAL_PLACES = [
  {
    id: 1,
    name: "신촌 낭만오지",
    address: "서울 마포구 고산길 17",
    latitude: 37.5556,
    longitude: 126.9368,
    naverMapUrl: "https://naver.me/5r9z7UxJ",
    category: "pub",
    crowdLevel: "moderate",
    cheerIntensity: 78,
    atmosphereTags: ["축구 응원"]
  },

  {
    id: 2,
    name: "신촌 썬더치킨",
    address: "서울 서대문구 연세로11길 20 1층",
    latitude: 37.5563,
    longitude: 126.9375,
    naverMapUrl: "https://naver.me/FTXDlTC9",
    category: "chicken",
    crowdLevel: "high",
    cheerIntensity: 85,
    atmosphereTags: ["치킨"]
  },

  {
    id: 3,
    name: "신촌 뉴타운",
    address: "서울 서대문구 연세로12길 27",
    latitude: 37.5572,
    longitude: 126.9383,
    naverMapUrl: "https://naver.me/IGJyfK7B",
    category: "pub",
    crowdLevel: "moderate",
    cheerIntensity: 72,
    atmosphereTags: ["TV"]
  },

  {
    id: 4,
    name: "홍대 만선호프",
    address: "서울 마포구 와우산로17길 15",
    latitude: 37.5515,
    longitude: 126.9227,
    naverMapUrl: "https://naver.me/xq3drtjR",
    category: "pub",
    crowdLevel: "high",
    cheerIntensity: 91,
    atmosphereTags: ["호프"]
  },

  {
    id: 5,
    name: "신촌 오퍼스",
    address: "서울 서대문구 연세로7길 18 2층",
    latitude: 37.5551,
    longitude: 126.9362,
    naverMapUrl: "https://naver.me/Gipd4Lqn",
    category: "lounge",
    crowdLevel: "moderate",
    cheerIntensity: 74,
    atmosphereTags: ["실내"]
  }
];

export const CATEGORY_DETAILS = {
  all: { label: '전체', color: 'bg-zinc-800 text-zinc-100' },
  pub: { label: '스포츠 펍', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' },
  chicken: { label: '치킨집', color: 'bg-amber-950/80 text-amber-300 border-amber-500/30' },
  lounge: { label: '라운지', color: 'bg-purple-950/80 text-purple-300 border-purple-500/30' },
};

export const CROWD_DETAILS = {
  moderate: {
    label: '보통',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
  },
  high: {
    label: '혼잡',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30'
  }
};

export const REGIONS = [
  { value: 'all', label: '전체 서울' },
  { value: 'hongdae', label: '홍대/신촌' }
];

export const ATMOSPHERE_TAGS_POOL = [
  '축구 응원',
  '치킨',
  '맥주',
  '실내',
  '대형 스크린'
];
