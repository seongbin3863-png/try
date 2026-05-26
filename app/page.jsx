"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Plus, ShieldCheck, Map, Clock, 
  HelpCircle, Sparkles, MessageSquareCode, Share2, Compass, AlertTriangle,
  Upload, List, X, Globe, MapPin, Sparkles as Sparkles2
} from 'lucide-react';
import { INITIAL_PLACES } from '../src/sampleData';

// Import sub-components
import MapContainer from '../src/components/MapContainer';
import PlaceDetail from '../src/components/PlaceDetail';
import FilterBar from '../src/components/FilterBar';
import ReportModal from '../src/components/ReportModal';
import AdminPanel from '../src/components/AdminPanel';
import KakaoMapGuide from '../src/components/KakaoMapGuide';
import UploadModal from '../src/components/UploadModal';

// Initial Mock Pending submissions to make Admin Panel look realistic right away
const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-1',
    placeName: '성수 피치사이드 스포클럽',
    address: '서울특별시 성동구 아차산로 45 1층',
    region: 'gwanghwamun',
    category: 'pub',
    atmosphereTags: ['미친 응원 분위기', '축덕 많음', '웅장한 사운드'],
    screenSize: '250인치 전구형 프로젝터 및 빔스크린 2대',
    reservationRequired: true,
    soloFriendly: true,
    instagramUrl: 'https://instagram.com',
    naverMapUrl: 'https://map.naver.com',
    description: '빈티지한 컨테이너 감성의 스포츠 아지트로 축구 국가대표 매치 기간 동안 대량 대관으로 붉은악마 축제를 주최합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sub-2',
    placeName: '합정동 맥주 테크 스타디움',
    address: '서울특별시 마포구 독막로 12길 11 지하 1층',
    region: 'hongdae',
    category: 'chicken',
    atmosphereTags: ['치맥의 성지', '소리 질러도 안 혼남', '대형 스크린 3개'],
    screenSize: '150인치 서라운드 LED 스테이지 스크린',
    reservationRequired: false,
    soloFriendly: true,
    instagramUrl: 'https://instagram.com',
    naverMapUrl: 'https://map.naver.com',
    description: '다양한 수제 맥주 탭과 바삭한 크리스피 치킨이 축구 중계용 웅장한 사운드 시스템을 만나 월드컵 축제를 완성합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export default function Page() {
  // Main Databases stored in LocalStorage for persistence
  const [places, setPlaces] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Floating list drawer and upload modal toggles for Geojimap UX
  const [isListOpen, setIsListOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filter conditions state
  const [filters, setFilters] = useState({
    region: 'all',
    category: 'all',
    minCheer: 0,
    soloFriendlyOnly: false,
    outdoorOnly: false,
    noReservationNeeded: false,
    criticalOnly: false
  });

  // Navigation tab state: 'stadium' (Map & Hub), 'admin' (Console), 'doc' (Integration Docs)
  const [activeTab, setActiveTab] = useState('stadium');

  // Modal triggers
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Sports countdown timer (e.g. South Korea vs Brazil/Uruguay World Cup Event D-Day simulation)
  const [countString, setCountString] = useState('02일 14시간 59분 42초');

  // Load from local storage on mount
  useEffect(() => {
    const cachedPlaces = localStorage.getItem('worldcup_map_places_v4');
    const cachedSubmissions = localStorage.getItem('worldcup_map_submissions');

    if (cachedPlaces) {
      const parsed = JSON.parse(cachedPlaces);
      setPlaces(parsed);
      if (parsed.length > 0) {
        setSelectedPlace(parsed[0]); // default detail
      }
    } else {
      setPlaces(INITIAL_PLACES);
      localStorage.setItem('worldcup_map_places_v4', JSON.stringify(INITIAL_PLACES));
      setSelectedPlace(INITIAL_PLACES[0]);
    }

    if (cachedSubmissions) {
      setSubmissions(JSON.parse(cachedSubmissions));
    } else {
      setSubmissions(INITIAL_SUBMISSIONS);
      localStorage.setItem('worldcup_map_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
    }
  }, []);

  // Update Countdown simulation ticking
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Target is D-Day + 2 days
      const days = "02";
      const hours = String(23 - now.getHours()).padStart(2, '0');
      const mins = String(59 - now.getMinutes()).padStart(2, '0');
      const secs = String(59 - now.getSeconds()).padStart(2, '0');
      setCountString(`${days}일 ${hours}시간 ${mins}분 ${secs}초`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger brief alert toasts
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1. Post a live emoji reaction up the screen (Increments counters)
  const handlePostReaction = (placeId, reactionType) => {
    const updated = places.map((place) => {
      if (place.id === placeId) {
        const reactions = { ...place.realtimeReactions };
        if (reactionType === 'fire') reactions.fireCount += 1;
        if (reactionType === 'cheer') reactions.cheerCount += 1;
        if (reactionType === 'noSeat') reactions.noSeatCount += 1;
        if (reactionType === 'going') reactions.goingCount += 1;
        
        // Slightly increase cheer intensity on live reaction activity! (caps at 99%)
        const nextIntensity = Math.min(place.cheerIntensity + 1, 99);

        const newPlaceObj = { 
          ...place, 
          realtimeReactions: reactions,
          cheerIntensity: nextIntensity
        };
        // Keep selected state inline
        if (selectedPlace?.id === placeId) {
          setSelectedPlace(newPlaceObj);
        }
        return newPlaceObj;
      }
      return place;
    });

    setPlaces(updated);
    localStorage.setItem('worldcup_map_places_v4', JSON.stringify(updated));
  };

  // 2. Report/Submit a new viewing venue spot
  const handleReportPlaceSubmit = (formData) => {
    const newSubmission = {
      id: `sub-${Date.now()}`,
      placeName: formData.placeName,
      address: formData.address,
      region: formData.region,
      category: formData.category,
      atmosphereTags: formData.atmosphereTags,
      screenSize: formData.screenSize,
      reservationRequired: formData.reservationRequired,
      soloFriendly: formData.soloFriendly,
      instagramUrl: formData.instagramUrl,
      naverMapUrl: formData.naverMapUrl,
      description: formData.description,
      imageUrl: formData.imageUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const nextSubs = [newSubmission, ...submissions];
    setSubmissions(nextSubs);
    localStorage.setItem('worldcup_map_submissions', JSON.stringify(nextSubs));
    
    setIsReportOpen(false);
    triggerToast('🚨 제보 접수 완료! 관리자 통제실(Admin Console)에서 즉시 승인 심사가 가능합니다!');
    
    // Auto shift view to the Admin Console for immediate interaction feedback!
    setTimeout(() => {
      setActiveTab('admin');
    }, 1500);
  };

  // 3. Admin: Approve a submission place (adds to places list and renders map pin)
  const handleApproveSubmission = (subId) => {
    const targetSub = submissions.find(s => s.id === subId);
    if (!targetSub) return;

    // Map submission fields to active Place schema with viewport positioning
    // Assign random x/y range in Seoul grid if not geo-mapped
    const randX = 35 + Math.floor(Math.random() * 45); // 35-80
    const randY = 30 + Math.floor(Math.random() * 45); // 30-75

    const newPlace = {
      id: `place-${Date.now()}`,
      name: targetSub.placeName,
      category: targetSub.category,
      categoryLabel: targetSub.category === 'pub' ? '스포츠 펍' : targetSub.category === 'chicken' ? '치킨집/호프' : targetSub.category === 'plaza' ? '야외 응원' : '대형 스크린',
      address: targetSub.address,
      region: targetSub.region,
      regionLabel: targetSub.region === 'gwanghwamun' ? '광화문/종로' : targetSub.region === 'hongdae' ? '홍대/신촌' : targetSub.region === 'gangnam' ? '강남/역삼' : targetSub.region === 'itaewon' ? '이태원/용산' : '잠실/송파',
      latitude: targetSub.region === 'gangnam' ? 37.50 : targetSub.region === 'jamsil' ? 37.51 : targetSub.region === 'itaewon' ? 37.53 : targetSub.region === 'gwanghwamun' ? 37.57 : 37.55,
      longitude: targetSub.region === 'jamsil' ? 127.08 : targetSub.region === 'gangnam' ? 127.03 : targetSub.region === 'itaewon' ? 126.99 : 126.97,
      x: randX,
      y: randY,
      imageUrl: targetSub.imageUrl,
      atmosphereTags: targetSub.atmosphereTags,
      crowdLevel: 'moderate',
      crowdLabel: '✨ 평온 (새로 제보된 곳)',
      cheerIntensity: 75,
      screenSize: targetSub.screenSize,
      reservationRequired: targetSub.reservationRequired,
      soloFriendly: targetSub.soloFriendly,
      instagramUrl: targetSub.instagramUrl,
      naverMapUrl: targetSub.naverMapUrl,
      description: targetSub.description,
      realtimeReactions: {
        fireCount: 1,
        cheerCount: 1,
        noSeatCount: 0,
        goingCount: 3
      },
      approved: true,
      createdAt: new Date().toISOString()
    };

    // Update submissions list
    const nextSubs = submissions.map(s => s.id === subId ? { ...s, status: 'approved' } : s);
    setSubmissions(nextSubs);
    localStorage.setItem('worldcup_map_submissions', JSON.stringify(nextSubs));

    // Append to live places
    const nextPlaces = [newPlace, ...places];
    setPlaces(nextPlaces);
    localStorage.setItem('worldcup_map_places_v4', JSON.stringify(nextPlaces));

    setSelectedPlace(newPlace);
    triggerToast(`🎉 [${newPlace.name}] 승인 완료! 즉시 경기 관람 지도로 핀이 노출됩니다.`);
    
    // Pull check back to primary stadium map
    setTimeout(() => {
      setActiveTab('stadium');
    }, 1800);
  };

  // Bulk Import handler
  const handleBulkImport = (newPlaces) => {
    const updatedPlaces = [...newPlaces, ...places];
    setPlaces(updatedPlaces);
    localStorage.setItem('worldcup_map_places_v4', JSON.stringify(updatedPlaces));
    if (newPlaces.length > 0) {
      setSelectedPlace(newPlaces[0]); // focus on the first uploaded place
    }
    triggerToast(`📥 대량 파일 업로드 성공! ${newPlaces.length}개의 응원 핀이 지도 좌표에 맞게 실시간 탑재되었습니다.`);
  };

  // 4. Admin: Reject a submission
  const handleRejectSubmission = (subId) => {
    const nextSubs = submissions.map(s => s.id === subId ? { ...s, status: 'rejected' } : s);
    setSubmissions(nextSubs);
    localStorage.setItem('worldcup_map_submissions', JSON.stringify(nextSubs));
    triggerToast('🚫 제보 보류 처리 완료. 데이터베이스 보관함에 마킹되었습니다.');
  };

  // 5. Admin: Permadelete submission entry
  const handleDeleteSubmission = (subId) => {
    const nextSubs = submissions.filter(s => s.id !== subId);
    setSubmissions(nextSubs);
    localStorage.setItem('worldcup_map_submissions', JSON.stringify(nextSubs));
    triggerToast('🗑️ 제출 레코드가 완전히 삭제되었습니다.');
  };

  // 6. Reset Filters
  const handleResetFilters = () => {
    setFilters({
      region: 'all',
      category: 'all',
      minCheer: 0,
      soloFriendlyOnly: false,
      outdoorOnly: false,
      noReservationNeeded: false,
      criticalOnly: false
    });
    triggerToast('🧹 모든 아레나 필터 조건이 정리되었습니다.');
  };

  // Determine active filters count for badge
  const activeFiltersCount = 
    (filters.region !== 'all' ? 1 : 0) + 
    (filters.category !== 'all' ? 1 : 0) + 
    (filters.minCheer > 0 ? 1 : 0) + 
    (filters.soloFriendlyOnly ? 1 : 0) + 
    (filters.outdoorOnly ? 1 : 0) + 
    (filters.noReservationNeeded ? 1 : 0) + 
    (filters.criticalOnly ? 1 : 0);

  // Apply visual filtering on places list
  const filteredPlaces = places.filter(place => {
    if (filters.region !== 'all' && place.region !== filters.region) return false;
    if (filters.category !== 'all' && place.category !== filters.category) return false;
    if (place.cheerIntensity < filters.minCheer) return false;
    if (filters.soloFriendlyOnly && !place.soloFriendly) return false;
    if (filters.noReservationNeeded && place.reservationRequired) return false;
    if (filters.outdoorOnly && place.category !== 'plaza') return false;
    if (filters.criticalOnly && place.crowdLevel !== 'critical') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-red-650 selection:text-white pb-12 flex flex-col">
      
      {/* Toast floating notify alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-100 max-w-md w-[85%] text-center text-xs font-semibold py-3 px-5 rounded-full bg-red-650 text-white border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 shrink-0 text-white animate-spin" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Stadium Header */}
      <header className="border-b border-zinc-900 bg-black/60 sticky top-0 backdrop-blur-md z-45 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand with neon heartbeat */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
            </span>
            <div>
              <h1 className="text-xl font-black text-white tracking-widest font-sans flex items-center gap-1">
                월드컵맵 <span className="text-red-500 text-sm italic">WorldCup Map</span>
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
                “지금 어디서 제일 뜨겁게 응원중일까?”
              </p>
            </div>
          </div>

          {/* Live countdown soccer sports board */}
          <div className="hidden md:flex items-center gap-4 bg-zinc-900/60 rounded-xl px-4 py-2 border border-zinc-800">
            <div className="text-left">
              <span className="text-[9px] uppercase font-mono text-rose-400 font-bold block leading-none">
                대한민국 vs 우루과이 Kick off
              </span>
              <span className="text-xs text-zinc-100 font-mono font-bold mt-1 block">
                {countString}
              </span>
            </div>
            <div className="h-6 w-[1.5px] bg-zinc-800" />
            <div className="text-center font-semibold text-[11px] text-zinc-400 bg-red-500/15 border border-red-500/20 px-2 py-1 rounded">
              D-Day ⚔️ 대전격돌
            </div>
          </div>

          {/* Navigator Links & CTA */}
          <div className="flex items-center gap-2">
            <nav className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800/80 mr-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('stadium')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all font-medium ${activeTab === 'stadium' ? 'bg-red-650 text-white font-semibold shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>경기 응원맵</span>
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium relative ${activeTab === 'admin' ? 'bg-red-650 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-100'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>승인 관리소</span>
                {submissions.filter(s => s.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono">
                    {submissions.filter(s => s.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('doc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${activeTab === 'doc' ? 'bg-red-650 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>연계 가이드</span>
              </button>
            </nav>

            {/* Bulk Data Upload button (CSV / JSON) */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-transform hover:scale-102 flex items-center gap-1.5 h-9 shrink-0 shadow-lg"
              title="CSV 또는 JSON 파일을 읽어 즉각적인 축구 펍 핀을 추가 생성합니다."
            >
              <Upload className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">데이터 업로드</span>
            </button>

            {/* CTA report button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-transform hover:scale-102 flex items-center gap-1.5 h-9 shrink-0 shadow-[0_0_12px_rgba(220,38,38,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>여기 중계해요!</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 mt-6">
        
        {/* TAB 1: Stadium Core map and visual detail card */}
        {activeTab === 'stadium' && (
          <div className="relative space-y-4">
            
            {/* Main Interactive Map & Core Overlay Layout (Geojimap Style) */}
            <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-900 bg-zinc-950 shadow-2xl">
              
              {/* Map Container - taking complete center stage */}
              <MapContainer 
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                onSelectPlace={(place) => {
                  setSelectedPlace(place);
                  // Auto close list drawer on mobile to maximize space for detailed Bottom Sheet
                  if (window.innerWidth < 768) {
                    setIsListOpen(false);
                  }
                }}
                onOpenReportModal={() => setIsReportOpen(true)}
                filteredPlacesCount={filteredPlaces.length}
              />

              {/* Floating Trigger HUD Buttons for Drawer Overlays */}
              <div className="absolute top-20 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                <button
                  type="button"
                  onClick={() => setIsListOpen(prev => !prev)}
                  className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 rounded-xl border backdrop-blur-md transition-all text-xs font-bold shadow-lg ${
                    isListOpen 
                      ? 'bg-red-650 border-red-500 text-white shadow-[0_0_15px_rgba(229,57,53,0.3)]'
                      : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-100 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>📋 응원 장소 리스트 ({filteredPlaces.length})</span>
                </button>
              </div>

              {/* Sliding List Drawer (Geojimap Sidebar Overlay) */}
              <AnimatePresence>
                {isListOpen && (
                  <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute top-32 md:top-36 bottom-4 left-4 z-20 w-80 max-w-[90%] bg-zinc-950/95 border border-zinc-900 rounded-2xl flex flex-col shadow-2xl overflow-hidden backdrop-blur-md pointer-events-auto border-red-500/10"
                  >
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between p-3.5 border-b border-zinc-900 bg-black/40">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-zinc-500" />
                        응원 성지 목록 ({filteredPlaces.length})
                      </h4>
                      <button 
                        onClick={() => setIsListOpen(false)}
                        className="text-zinc-500 hover:text-white p-1 rounded bg-zinc-900/40"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Drawer Body (List of Places) */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-full scrollbar-thin">
                      {filteredPlaces.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">
                          <AlertTriangle className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                          <p className="text-xs font-semibold">검색 조건에 일치하는 곳이 없습니다.</p>
                          <button 
                            onClick={handleResetFilters}
                            className="text-[10px] text-red-400 underline mt-1 mx-auto block"
                          >
                            필터 전면 지우기
                          </button>
                        </div>
                      ) : (
                        filteredPlaces.map((place) => {
                          const isSelected = selectedPlace?.id === place.id;
                          
                          return (
                            <div
                              key={place.id}
                              onClick={() => {
                                setSelectedPlace(place);
                                if (window.innerWidth < 640) {
                                  setIsListOpen(false);
                                }
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected 
                                  ? 'bg-zinc-900 border-red-500/80 shadow-md' 
                                  : 'bg-zinc-950/75 border-zinc-900 hover:border-zinc-800'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-semibold text-zinc-200 truncate">{place.name.split(' (')[0]}</h5>
                                <p className="text-[9.5px] text-zinc-400 truncate mt-0.5">{place.address}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                  <span className="text-[9px] font-medium text-zinc-500 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-850">
                                    {place.categoryLabel}
                                  </span>
                                  <span className="text-[9px] font-mono text-red-400 font-semibold">
                                    🔥 {place.cheerIntensity}%
                                  </span>
                                </div>
                              </div>
                              
                              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-zinc-900 bg-zinc-900">
                                <img 
                                  src={place.imageUrl} 
                                  alt={place.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Seamless Sliding Bottom Sheet / Side Panel for Selected Place Detail */}
              <AnimatePresence>
                {selectedPlace && (
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 220 }}
                    className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:top-20 md:w-96 z-40 bg-zinc-950/98 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto h-[380px] md:h-auto border-red-500/20"
                  >
                    <PlaceDetail 
                      place={selectedPlace}
                      onPostReaction={handlePostReaction}
                      onDeselect={() => setSelectedPlace(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Filter bar - placed directly beneath the grand map window */}
            <div className="pt-2">
              <FilterBar 
                filters={filters}
                onChangeFilters={(next) => setFilters(next)}
                onResetFilters={handleResetFilters}
                activeFiltersCount={activeFiltersCount}
              />
            </div>
            
          </div>
        )}

        {/* TAB 2: Admin Control flow */}
        {activeTab === 'admin' && (
          <AdminPanel 
            submissions={submissions}
            onApprove={handleApproveSubmission}
            onReject={handleRejectSubmission}
            onDeleteSubmission={handleDeleteSubmission}
          />
        )}

        {/* TAB 3: Guide documentation */}
        {activeTab === 'doc' && (
          <KakaoMapGuide />
        )}

      </main>

      {/* Global interactive report spot modal */}
      <AnimatePresence>
        {isReportOpen && (
          <ReportModal 
            onClose={() => setIsReportOpen(false)}
            onSubmit={handleReportPlaceSubmit}
          />
        )}
      </AnimatePresence>

      {/* Global bulk upload modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal 
            onClose={() => setIsUploadOpen(false)}
            onImportSuccess={handleBulkImport}
          />
        )}
      </AnimatePresence>

      {/* Footer credits block */}
      <footer className="mt-16 border-t border-zinc-900/60 pt-6 text-center select-none text-zinc-500 text-[10.5px] font-mono leading-relaxed px-4 max-w-7xl mx-auto font-sans">
        <p>© 2026 월드컵맵 (WorldCup Map). All soccer cheering communities in Seoul united.</p>
        <p className="mt-1 text-zinc-600">Designed with modern visual dark neon tactical displays. No real database required for pre-launch evaluation.</p>
      </footer>
    </div>
  );
}
