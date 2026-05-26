import '../src/index.css';

export const metadata = {
  title: '월드컵맵 WorldCup Map - 실시간 서울 길거리 응원 성지',
  description: '지금 어디서 제일 뜨겁게 응원중일까? 서울 내 월드컵, 축구, 매치 길거리 응원 및 스포츠 펍 실시간 레이더 지도 서비스입니다.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
