import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beer, Flame, Tv, Users, Calendar, Footprints, AlertCircle, 
  MapPin, Instagram, ExternalLink, ThumbsUp, Send, Trophy
} from 'lucide-react';
import { CATEGORY_DETAILS, CROWD_DETAILS } from '../sampleData';

export default function PlaceDetail({
  place,
  onPostReaction,
  onDeselect
}) {
  const [particles, setParticles] = useState([]);
  const [particleIdCounter, setParticleIdCounter] = useState(0);

  // Trigger floating particle effects
  const spawnParticle = (char) => {
    const id = particleIdCounter;
    setParticleIdCounter(prev => prev + 1);
    
    // Random offset
    const randomX = Math.random() * 80 - 40; // -40 ~ 40px offsets
    const newParticle = {
      id,
      char,
      x: randomX,
      y: -20
    };
    
    setParticles(prev => [...prev, newParticle]);

    // Cleanup after animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1500);
  };

  const handlePostReaction = (type, char) => {
    onPostReaction(place.id, type);
    spawnParticle(char);
  };

  const categoryDetail = CATEGORY_DETAILS[place.category] || CATEGORY_DETAILS.all;
  const crowdDetail = CROWD_DETAILS[place.crowdLevel] || CROWD_DETAILS.moderate;

  return (
    <div 
      id={`place-detail-${place.id}`}
      className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl transition-all h-full flex flex-col relative"
    >
      {/* Semi-Drag Handle Accent for premium Bottom-Sheet feel */}
      <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto my-2 md:my-0 md:h-0 shrink-0 block md:hidden" />

      {/* Floating particles stage */}
      <div className="absolute inset-x-0 bottom-48 h-64 pointer-events-none overflow-hidden z-40">
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0.8, y: 150, x: p.x }}
              animate={{ 
                opacity: [1, 0.8, 0], 
                scale: [1, 1.4, 0.9],
                y: -100, 
                x: p.x + (Math.sin(p.id) * 30) // wave motion
              }}
              transition={{ duration: 1.3, ease: "easeOut" }}
              className="absolute left-1/2 -translate-x-1/2 text-3xl select-none"
            >
              {p.char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hero Header Back Drop */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden shrink-0">
        <img 
          src={place.imageUrl} 
          alt={place.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-80 transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        {/* Category sticker */}
        <span className="absolute top-4 left-4 text-[10.5px] font-semibold px-2.5 py-1 rounded-md border backdrop-blur-md bg-black/60 border-white/10 text-white">
          {place.categoryLabel}
        </span>

        {/* Deselect close button */}
        <button 
          onClick={onDeselect}
          className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 rounded-full w-9 h-9 flex items-center justify-center text-zinc-300 hover:text-white transition-all border border-zinc-800"
          title="장소 닫기"
        >
          <span className="text-xl font-medium leading-none block">×</span>
        </button>

        {/* Live cheer stadium noise badge */}
        <div className="absolute bottom-4 right-4 bg-red-650 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-lg animate-pulse">
          <Trophy className="w-3 h-3 animate-bounce" />
          <span>목청 게이지 {place.cheerIntensity}%</span>
        </div>
      </div>

      {/* Detail Core Content */}
      <div className="p-5 flex-1 overflow-y-auto scrollbar-thin flex flex-col">
        {/* Place Title */}
        <h3 className="text-xl font-bold text-zinc-100 font-sans tracking-tight mb-2">
          {place.name}
        </h3>

        {/* Address & Navigation buttons */}
        <div className="flex items-start gap-1 text-xs text-zinc-400 mb-4">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-red-500 shrink-0" />
          <span className="leading-relaxed">{place.address}</span>
        </div>

        {/* Crowd Density state */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-md border font-sans font-medium ${crowdDetail.color}`}>
            {crowdDetail.label}
          </span>
          {place.reservationRequired ? (
            <span className="text-xs bg-cyan-950/50 text-cyan-400 border border-cyan-800/20 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              예약 필수
            </span>
          ) : (
            <span className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800/20 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              선착순 입장
            </span>
          )}
          {place.soloFriendly && (
            <span className="text-xs bg-purple-950/50 text-purple-400 border border-purple-800/20 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              혼자가도 환영
            </span>
          )}
        </div>

        {/* Description intro */}
        <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 mb-4 select-text">
          {place.description}
        </p>

        {/* Detailed Sports Spec Cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-[11px] bg-zinc-950 rounded-xl p-3.5 border border-zinc-900/80">
          <div>
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider font-mono text-[9px]">지역 <span className="text-zinc-600">/ Area</span></span>
            <span className="text-zinc-200 mt-1 block font-medium select-text">
              📍 {place.district || place.regionLabel || '홍대/신촌'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 font-semibold block uppercase tracking-wider font-mono text-[9px]">응원 분위기 <span className="text-zinc-600">/ Vibe</span></span>
            <span className="text-zinc-200 mt-1 block font-medium select-text text-amber-400">
              🍻 {place.vibe || place.atmosphereTags?.[0] || '열기 넘침'}
            </span>
          </div>
          <div className="border-t border-zinc-900/60 pt-2.5 mt-2.5 col-span-2 grid grid-cols-2 gap-2.5">
            <div>
              <span className="text-zinc-500 font-semibold block uppercase tracking-wider font-mono text-[9px]">스크린 크기 <span className="text-zinc-600">/ Screen</span></span>
              <span className="text-zinc-200 mt-1 block font-medium flex items-center gap-1 select-text">
                <Tv className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                {place.screen || place.screenSize || '대형 스크린'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold block uppercase tracking-wider font-mono text-[9px]">응원 스타일 <span className="text-zinc-600">/ Cheering</span></span>
              <span className="text-zinc-200 mt-1 block font-medium flex items-center gap-1 select-text text-red-400">
                <Trophy className="w-3.5 h-3.5 text-red-500 shrink-0 animate-pulse" />
                {place.cheering_style || '파이팅형'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Atmosphere Tags */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-zinc-400 block mb-2 font-mono tracking-wider">주요 응원 분위기</span>
          <div className="flex flex-wrap gap-1.5">
            {place.atmosphereTags.map((tag, idx) => (
              <span 
                key={idx}
                className="text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded-md hover:border-red-500/30 transition-all cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-900 my-2 pt-4 mt-auto">
          {/* External hyper links */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <a 
              href={place.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-pink-950/20 hover:bg-pink-950/40 text-pink-300 hover:text-pink-200 border border-pink-500/20 transition-all text-center"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>실시간 스토어</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href={place.naverMapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-green-950/20 hover:bg-green-950/40 text-green-300 hover:text-green-200 border border-green-500/20 transition-all text-center"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>네이버 지도</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Gamified Live Reaction Button Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                현장 직관러 실시간 상태 리포트
              </span>
              <span className="text-[10px] text-zinc-500 leading-none">중복 클릭 가능</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePostReaction('cheer', '🔊')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 hover:bg-red-950/20 text-zinc-300 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 transition-all active:scale-95 group"
                title="지금 응원 열기가 하늘을 찌르고 있음을 전파합니다."
              >
                <span className="text-lg group-hover:scale-115 transition-transform">🔊</span>
                <span className="text-[10px] font-medium mt-1 font-sans">함성 질러</span>
                <span className="text-[10px] font-mono text-zinc-500 font-semibold group-hover:text-red-400 mt-0.5">
                  {place.realtimeReactions?.cheerCount || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePostReaction('fire', '🔥')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 hover:bg-red-950/20 text-zinc-300 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 transition-all active:scale-95 group"
                title="사람이 무지하게 많아 분위기가 후끈 뜨겁습니다."
              >
                <span className="text-lg group-hover:scale-115 transition-transform">🔥</span>
                <span className="text-[10px] font-medium mt-1 font-sans">분위기 미침</span>
                <span className="text-[10px] font-mono text-zinc-500 font-semibold group-hover:text-red-400 mt-0.5">
                  {place.realtimeReactions?.fireCount || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePostReaction('noSeat', '🚫')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 hover:bg-neutral-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 transition-all active:scale-95 group"
                title="남아 있는 자리가 완전히 없음을 제보합니다."
              >
                <span className="text-lg group-hover:scale-115 transition-transform">🚫</span>
                <span className="text-[10px] font-medium mt-1 font-sans">자리 없음</span>
                <span className="text-[10px] font-mono text-zinc-500 font-semibold group-hover:text-zinc-300 mt-0.5">
                  {place.realtimeReactions?.noSeatCount || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePostReaction('going', '🚩')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 hover:bg-cyan-950/20 text-zinc-300 hover:text-cyan-400 border border-zinc-800 hover:border-cyan-500/20 transition-all active:scale-95 group"
                title="오늘 경기 보러 이곳을 갈 예정이거나 가는 중입니다."
              >
                <span className="text-lg group-hover:scale-115 transition-transform">🚩</span>
                <span className="text-[10px] font-medium mt-1 font-sans">여기 감!</span>
                <span className="text-[10px] font-mono text-zinc-500 font-semibold group-hover:text-cyan-400 mt-0.5">
                  {place.realtimeReactions?.goingCount || 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
