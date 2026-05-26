import React from 'react';
import { 
  FileText, Database, Shield, Lock, Map, ExternalLink, Sparkles, CheckCircle2 
} from 'lucide-react';

export default function KakaoMapGuide() {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6 select-text">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-4">
        <h3 className="text-base font-bold text-amber-500 font-sans tracking-tight flex items-center gap-1.5">
          <Database className="w-5 h-5 text-amber-500" />
          Next.js + Supabase + 카카오맵 MVP 구축 로드맵 가이드
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          현재 MVP에서 작성한 상태와 리포팅 시스템을 배포형 프로덕션 버전으로 이관할 때 필요한 SQL 스키마 및 가이드입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        {/* Section 1: SQL Schema schemas */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            1. Supabase PostgreSQL 스키마 설계
          </h4>
          <p className="text-zinc-400 leading-relaxed">
            Supabase의 <strong>SQL Editor</strong>에 붙여넣어 제보 및 실시간 반응용 관계형 데이터베이스 테이블을 즉시 프로비저닝할 수 있습니다.
          </p>

          <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800/80 font-mono text-[10.5px] text-zinc-300 max-h-64 overflow-y-auto select-all">
{`-- 1. 응원 장소 데이터베이스 테이블
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- pub, chicken, plaza, cinema, lounge
  address VARCHAR(255) NOT NULL,
  region VARCHAR(55) NOT NULL, -- gwanghwamun, hongdae 등
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  atmosphere_tags TEXT[], -- PostgreSQL Array Type
  crowd_level VARCHAR(30) DEFAULT 'moderate', -- critical, high, moderate
  cheer_intensity INTEGER DEFAULT 70, -- 0-100 분위기
  screen_size VARCHAR(100),
  reservation_required BOOLEAN DEFAULT false,
  solo_friendly BOOLEAN DEFAULT true,
  instagram_url TEXT,
  naver_map_url TEXT,
  description TEXT,
  approved BOOLEAN DEFAULT false, -- 실시간 관리 승인 플래그
  fire_count INTEGER DEFAULT 0,
  cheer_count INTEGER DEFAULT 0,
  no_seat_count INTEGER DEFAULT 0,
  going_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 유저 실시간 수다 반응 로그 기록 (중복 투표 어뷰징 로깅용 Optional)
CREATE TABLE reactions_log (
  id BIGSERIAL PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
          </div>
          <div className="bg-zinc-900/40 p-3 rounded-lg border border-red-500/10 text-zinc-400 text-[11px] leading-relaxed">
            💡 <strong>실시간 반응 Sync:</strong> Supabase의 <strong>Realtime Replication</strong> 기능을 <code>places</code>와 <code>reactions_log</code>에 토글 활성화하면, 한 사람이 "함성 질러" 버튼을 눌렀을 때 접속 중인 수천 대 모바일 화면에 숫자가 실시간으로 상승하는 애니메이션이 동기화됩니다.
          </div>
        </div>

        {/* Section 2: Kakao API Integration Integration */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            2. 카카오맵 SDK 연동 가이드
          </h4>
          <p className="text-zinc-400 leading-relaxed">
            카카오맵은 HTML iframe이 아닌 리얼 타임 자바스크립트 SDK입니다. <code>index.html</code> 혹은 Next.js의 <code>Script</code> 컴포넌트로 호출해야 정상 작동합니다.
          </p>

          <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800/80 font-mono text-[10.5px] text-zinc-300 max-h-64 overflow-y-auto select-all">
{`// /src/providers/KakaoMapProvider.jsx
import React, { useEffect, useRef } from 'react';

export function KakaoSoccerMap({ places, onSelectSpot }) {
  const mapRef = useRef(null);

  useEffect(() => {
    // 1. 카카오맵 API 스크립트 비동기 마운트
    const script = document.createElement('script');
    script.src = \`https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&autoload=false\`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        
        // 2. 서울 중심 위치로 지도 바인딩
        const options = {
          center: new window.kakao.maps.LatLng(37.5716, 126.9769),
          level: 5 // 확대 수준
        };
        const map = new window.kakao.maps.Map(mapRef.current, options);

        // 3. 응원 장소 데이터 기준 마커 핀 생성 루프
        places.forEach(place => {
          const markerPos = new window.kakao.maps.LatLng(place.latitude, place.longitude);
          const marker = new window.kakao.maps.Marker({
            position: markerPos,
            map: map
          });

          // 커스텀 원형 네온 오버레이 생성
          const content = \`<div class="neon-soccer-pulse">\${place.cheer_intensity}%</div>\`;
          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: markerPos,
            content: content,
            yAnchor: 1.5
          });
          customOverlay.setMap(map);

          // 클릭 콜백 이벤트
          window.kakao.maps.event.addListener(marker, 'click', () => {
            onSelectSpot(place);
          });
        });
      });
    };
  }, [places]);

  return <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}`}
          </div>
          <p className="text-zinc-500 text-[10.5px] leading-relaxed">
            ※ 주의: 카카오맵 SDK는 사전에 카카오 개발자 콘솔 주소에 <code>http://localhost:3000</code> 및 본인의 실제 프로덕션 Vercel 도메인을 "웹 플랫폼 사이트 도메인"으로 설정해주셔야 크로스 도메인 오류나 흰 화면 버그 없이 실행됩니다.
          </p>
        </div>
      </div>

      <hr className="border-zinc-900" />

      {/* Section 3: Vercel Environmental Configuration and deployment */}
      <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-900 space-y-3">
        <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-500" />
          3. Vercel 배포 & 환경변수 설정 가이드
        </h4>
        <p className="text-zinc-400 text-xs leading-relaxed">
          프로덕션 배포 시 API Key와 민감 정보 보호를 위해 아래 환경변수 인스턴스를 설정해야 서비스가 정상 기동합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <span className="text-amber-400 font-mono font-semibold block mb-1">NEXT_PUBLIC_KAKAO_MAP_API_KEY</span>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              카카오 개발자 사이체(dapi.kakao.com)에서 발급받은 JavaScript App Key입니다. 클라이언트 영역 노출을 위해 <code>NEXT_PUBLIC_</code> 접두사를 사용합니다.
            </p>
          </div>
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <span className="text-emerald-400 font-mono font-semibold block mb-1">NEXT_PUBLIC_SUPABASE_URL & ANON_KEY</span>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Supabase 클라이언트 인스턴스 생성을 위한 API 엔드포인트 URL 및 익명 퍼블릭 토큰 키 정보입니다.
            </p>
          </div>
        </div>

        <div className="pt-2 text-zinc-500 text-[10.5px] leading-normal flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>본 구조는 월드컵 런칭 시 대규모 트래픽 분산을 지원하며, 고기능 렌더링에 적격인 세계 최고의 경량 클라우드 조합입니다.</span>
        </div>
      </div>
    </div>
  );
}
