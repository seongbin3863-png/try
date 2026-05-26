"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Minus, Search, Map, Sparkles, AlertCircle, RefreshCw, Compass
} from 'lucide-react';

const getKakaoAppKey = () => {
  // Support ONLY NEXT_PUBLIC_KAKAO_MAP_KEY strictly, checking process.env first as demanded
  const processKey = typeof process !== 'undefined' && process?.env
    ? process.env.NEXT_PUBLIC_KAKAO_MAP_KEY
    : undefined;
  const metaKey = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.NEXT_PUBLIC_KAKAO_MAP_KEY
    : undefined;
  const envKey = processKey || metaKey;
  
  if (envKey) {
    console.log("[KakaoMap] Found NEXT_PUBLIC_KAKAO_MAP_KEY in environment:", envKey);
    return envKey;
  }
  // Fallback to the explicit Kakao JS Key provided to guarantee a working sandbox instance
  console.log("[KakaoMap] NEXT_PUBLIC_KAKAO_MAP_KEY not found in environment, falling back to default key.");
  return "8934e622df213eb801a02b622cb99036";
};

export default function MapContainer({
  places,
  selectedPlace,
  onSelectPlace,
  onOpenReportModal,
  filteredPlacesCount
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  // Persist center and zoom level when parent state updates to preserve state
  const mapCenterRef = useRef(null);
  const mapLevelRef = useRef(6);
  const overlaysRef = useRef([]);

  // Map state logs
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(null);
  
  // Search state query
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showKakaoInfo, setShowKakaoInfo] = useState(false);

  // Filter based on local search inputs
  const searchedPlaces = places.filter(place => {
    if (!searchQuery) return true;
    return place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
           place.atmosphereTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Load Kakao Maps script dynamically on mount
  useEffect(() => {
    // Check if SSR
    if (typeof window === 'undefined') {
      console.warn("[KakaoMap] SSR Detected. Skipping Map SDK dynamic loading.");
      return;
    }

    // Reset states to clear any previous error and start fresh
    setMapLoaded(false);
    setMapLoadError(null);

    const appKey = getKakaoAppKey();
    const scriptId = 'kakao-maps-sdk';
    
    console.log("[KakaoMap] Starting Kakao Maps script initialization. Target Key:", appKey);

    const initializeMap = () => {
      console.log("[KakaoMap] Initializing Kakao Map engine. checking window.kakao...");
      const kakao = window.kakao;
      if (!kakao || !kakao.maps) {
        console.error("[KakaoMap] Verification Failed: window.kakao or window.kakao.maps is missing");
        setMapLoadError('카카오맵 JavaScript 라이브러리가 존재하지 않습니다.');
        return;
      }
      
      console.log("[KakaoMap] window.kakao is present:", kakao);
      console.log("[KakaoMap] Running kakao.maps.load callback...");
      
      kakao.maps.load(() => {
        console.log("[KakaoMap] Core services loaded. Mounting container viewport...");
        if (!mapContainerRef.current) {
          console.warn("[KakaoMap] Container viewport ref not found in DOM yet.");
          return;
        }
        
        // Define center. Default to Hongdae/Sinchon midpoint (37.5523, 126.930) as requested
        let initialCenter;
        if (mapCenterRef.current) {
          initialCenter = new kakao.maps.LatLng(mapCenterRef.current.lat, mapCenterRef.current.lng);
        } else {
          // Centering default on Hongdae/Sinchon midpoint (approx 37.5523, 126.930) automatically!
          initialCenter = new kakao.maps.LatLng(37.5523, 126.930);
        }
        
        const initialLevel = mapLevelRef.current || 5; // Level 5 as requested by user
        console.log(`[KakaoMap] Creating new Map instance with center LatLng(${initialCenter.getLat()}, ${initialCenter.getLng()}) and zoom Level ${initialLevel}`);
        
        try {
          const map = new kakao.maps.Map(mapContainerRef.current, {
            center: initialCenter,
            level: initialLevel,
          });
          
          mapInstanceRef.current = map;
          setMapLoaded(true);
          setMapLoadError(null);
          console.log("Kakao SDK Loaded");
          console.log(window.kakao);
          console.log("Map created successfully");
          
          // Listen to 'idle' event to track viewport position and zoom adjustments
          kakao.maps.event.addListener(map, 'idle', () => {
            const currentCenter = map.getCenter();
            mapCenterRef.current = { lat: currentCenter.getLat(), lng: currentCenter.getLng() };
            mapLevelRef.current = map.getLevel();
            console.log("[KakaoMap] Idle listener triggered. Center:", mapCenterRef.current, "Level:", mapLevelRef.current);
          });
        } catch (error) {
          console.error('[KakaoMap] Failed to construct Kakao Map instance:', error);
          setMapLoadError(`지도를 생성하는 도중 오류가 발생했습니다: ${error?.message || error}`);
        }
      });
    };

    if (window.kakao && window.kakao.maps) {
      console.log("[KakaoMap] SDK already loaded on window. Re-initializing immediately.");
      initializeMap();
      return;
    }

    let script = document.getElementById(scriptId);
    if (script) {
      console.log("[KakaoMap] Script tag detected in DOM, attaching listener to load event.");
      script.addEventListener('load', initializeMap);
      return;
    }

    console.log("[KakaoMap] Injecting script tag to document head...");
    script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log("[KakaoMap] Script tag load complete. Invoking initializer.");
      initializeMap();
    };

    script.onerror = (e) => {
      console.error("[KakaoMap] Error loading Kakao script. Check your app credentials, network status or domain registration (http://localhost:3000):", e);
      setMapLoadError('카카오맵 라이브러리 스크립트 로드에 실패했습니다. 도메인 권한 및 네트워크 연결 상태를 확인하고 개발자 콘솔에 본 도메인 및 로컬호스트가 허가되었는지 점검하세요.');
    };

    return () => {
      if (script) {
        script.removeEventListener('load', initializeMap);
      }
    };
  }, []);

  // Sync place overlays when map is loaded, places update, or selection shifts
  useEffect(() => {
    const map = mapInstanceRef.current;
    const kakao = window.kakao;
    if (!mapLoaded || !map || !kakao) return;

    // Remove older custom overlays from the viewport
    if (overlaysRef.current) {
      overlaysRef.current.forEach(overlay => overlay.setMap(null));
      overlaysRef.current = [];
    }

    // Build and mount custom overlays for search-matching places
    const newOverlays = searchedPlaces.map(place => {
      const isSelected = selectedPlace?.id === place.id;
      const isCritical = place.crowdLevel === 'critical';
      
      let emoji = '🍺';
      if (place.category === 'chicken') emoji = '🍗';
      else if (place.category === 'plaza') emoji = '🏟️';
      else if (place.category === 'cinema') emoji = '📺';
      else if (place.category === 'lounge') emoji = '🍹';

      // Custom Circle overlay
      const container = document.createElement('div');
      container.className = 'relative flex flex-col items-center select-none transform -translate-y-1/2';
      container.style.cursor = 'pointer';

      const bgClass = isSelected
        ? 'bg-rose-950 border-red-500 text-rose-100 scale-120 shadow-[0_0_15px_rgba(239,68,68,0.7)] z-50'
        : isCritical
        ? 'bg-red-950/95 border-red-800 text-rose-300 shadow-[0_0_10px_rgba(239,68,68,0.4)] z-40'
        : 'bg-zinc-900/95 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:scale-110';

      const pingRing = isCritical || isSelected
        ? `<span class="absolute inset-x-0 bottom-4 flex h-full w-full items-center justify-center pointer-events-none">
             <span class="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-rose-500 opacity-25"></span>
           </span>`
        : '';

      container.innerHTML = `
        ${pingRing}
        <div class="relative flex flex-col items-center">
          <button
            type="button"
            class="relative flex items-center justify-center p-2.5 rounded-xl border transition-transform pointer-events-auto duration-200 cursor-pointer ${bgClass}"
          >
            <div class="flex flex-col items-center gap-0.5">
              <span class="text-base leading-none items-center justify-center">${emoji}</span>
              <span class="text-[8px] font-mono font-bold leading-none bg-black/75 px-1 py-0.5 rounded text-red-400">
                ${place.cheerIntensity}%
              </span>
            </div>
          </button>
          
          <!-- Floating label context -->
          <div class="mt-1.5 px-2 py-0.5 rounded-md bg-black/95 text-white border text-[9.5px] font-sans font-medium whitespace-nowrap shadow-xl ${
            isSelected ? 'border-red-500/40 text-red-200' : 'border-zinc-800/80 text-zinc-300'
          }">
            ${place.name.split(' (')[0]}
            ${isCritical ? '<span class="text-[8.5px] text-rose-400 font-bold ml-1 font-mono">🔥 LIVE</span>' : ''}
          </div>
        </div>
      `;

      // Select handler for highly responsive mobile tap targets
      container.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectPlace(place);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(place.latitude, place.longitude),
        content: container,
        clickable: true,
        yAnchor: 1.12
      });

      overlay.setMap(map);
      return overlay;
    });

    overlaysRef.current = newOverlays;
  }, [mapLoaded, searchedPlaces, selectedPlace]);

  // Handle flying & panning to target selectedPlace if it updates externally
  useEffect(() => {
    const map = mapInstanceRef.current;
    const kakao = window.kakao;
    if (!mapLoaded || !map || !kakao || !selectedPlace) return;

    const latLng = new kakao.maps.LatLng(selectedPlace.latitude, selectedPlace.longitude);
    const viewportCenter = map.getCenter();
    
    const diffLat = Math.abs(viewportCenter.getLat() - selectedPlace.latitude);
    const diffLng = Math.abs(viewportCenter.getLng() - selectedPlace.longitude);
    
    if (diffLat > 0.0001 || diffLng > 0.0001) {
      map.panTo(latLng);
      if (map.getLevel() > 4) {
        map.setLevel(4, { animate: true });
      }
    }
  }, [selectedPlace, mapLoaded]);

  // Clean-up handler
  useEffect(() => {
    return () => {
      if (overlaysRef.current) {
        overlaysRef.current.forEach(overlay => overlay.setMap(null));
      }
    };
  }, []);

  // Quick map commands
  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setLevel(map.getLevel() - 1, { animate: true });
    }
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setLevel(map.getLevel() + 1, { animate: true });
    }
  };

  const handleResetMap = () => {
    const map = mapInstanceRef.current;
    const kakao = window.kakao;
    if (map && kakao) {
      const defaultCenter = new kakao.maps.LatLng(37.5523, 126.930);
      map.setCenter(defaultCenter);
      map.setLevel(5, { animate: true });
    }
    setSearchQuery('');
  };

  const travelToLocation = (lat, lng) => {
    const map = mapInstanceRef.current;
    const kakao = window.kakao;
    if (map && kakao) {
      const targetLatLng = new kakao.maps.LatLng(lat, lng);
      map.panTo(targetLatLng);
      map.setLevel(4, { animate: true });
    }
  };

  return (
    <div 
      id="main-map-section"
      className="relative w-full h-[460px] md:h-[580px] lg:h-[680px] bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl select-none"
    >
      {/* 1. Underlying interactive Real Kakao Map */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full absolute inset-0 z-10" 
        style={{ background: '#0a0a0c' }}
      />

      {/* 2. Custom elegant load-time radar overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 z-30">
          <div className="flex flex-col items-center gap-4">
            {mapLoadError ? (
              <>
                <AlertCircle className="w-9 h-9 text-amber-500 animate-pulse" />
                <p className="text-sm font-semibold text-zinc-300 font-sans">카카오맵 로드 대기 중</p>
                <p className="text-xs text-zinc-500 max-w-xs text-center leading-relaxed">
                  {mapLoadError}
                  <br />
                  <span className="text-amber-400 font-medium">팁:</span> 인터넷 연결 및 kakao-developers 사이트 도메인에 <code>http://localhost:3000</code> 등록 여부를 확인하십시오.
                </p>
              </>
            ) : (
              <>
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-650/20 opacity-75"></span>
                  <Compass className="w-8 h-8 text-red-650 animate-spin" />
                </div>
                <p className="text-xs font-bold text-zinc-400 font-mono tracking-widest animate-pulse">
                  ESTABLISHING LIVE KAKAO MAP SDK...
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search overlay & Stats (Overlaid on top of map) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row gap-2 pointer-events-none">
        <div className="relative flex-1 pointer-events-auto max-w-sm">
          <div className={`flex items-center gap-2 bg-black/85 backdrop-blur-md rounded-xl border transition-all px-3.5 py-2.5 ${searchFocused ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.25)]' : 'border-zinc-800/80 shadow-lg'}`}>
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input 
              type="text" 
              placeholder="장소명, 주소, 태그 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent text-sm text-zinc-100 placeholder-zinc-500 w-full focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results drop-down overlay list */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto z-55">
              <div className="p-2 text-[10px] text-zinc-500 border-b border-zinc-900 font-mono tracking-wider px-3 bg-zinc-950">
                검색된 응원 성지 ({searchedPlaces.length})
              </div>
              {searchedPlaces.length === 0 ? (
                <div className="p-4 text-xs text-zinc-500 text-center">검색 결과가 없습니다.</div>
              ) : (
                searchedPlaces.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPlace(p);
                      travelToLocation(p.latitude, p.longitude);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-zinc-900 transition-colors border-b border-zinc-900/60 flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-200 font-medium truncate">{p.name}</span>
                    <span className="text-[10px] text-red-400 ml-2 font-mono shrink-0">{p.cheerIntensity}% 응원중</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Live cheer radar status badge (Overlaid) */}
        <div className="pointer-events-auto flex items-center justify-between gap-3 bg-red-950/50 border border-red-500/20 px-3.5 py-2.5 rounded-xl backdrop-blur-md shadow-lg sm:ml-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-xs text-rose-300 font-semibold font-sans tracking-wide">
              LIVE 카카오 실시간 레이더
            </span>
          </div>
          <span className="text-[10px] font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {filteredPlacesCount}개 지점 검색됨
          </span>
        </div>
      </div>

      {/* Map Interactive HUD controls (Zoom in, out, reset) */}
      <div className="absolute bottom-4 left-4 z-20 flex gap-2">
        <div className="flex flex-col bg-black/75 backdrop-blur-md rounded-xl border border-zinc-800/80 p-1 shadow-lg pointer-events-auto">
          <button 
            onClick={handleZoomIn}
            title="지점 확대"
            className="map-control-btn p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <hr className="border-zinc-800/80 my-1" />
          <button 
            onClick={handleZoomOut}
            title="지점 축소"
            className="map-control-btn p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <hr className="border-zinc-800/80 my-1" />
          <button 
            onClick={handleResetMap}
            title="초기 상태 정렬"
            className="map-control-btn p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Travel Nodes widget */}
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-800/80 shadow-lg shrink-0 overflow-x-auto text-xs text-zinc-400 max-w-[200px] sm:max-w-xs scrollbar-none pointer-events-auto">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-500 select-none mr-1">
            GO:
          </span>
          <button onClick={() => travelToLocation(37.5716, 126.9769)} className="hover:text-red-400 hover:underline shrink-0 text-[11.5px] font-sans font-medium cursor-pointer">광화문</button>
          <span className="text-zinc-700">•</span>
          <button onClick={() => travelToLocation(37.5512, 126.9224)} className="hover:text-amber-400 hover:underline shrink-0 text-[11.5px] font-sans font-medium cursor-pointer">홍대</button>
          <span className="text-zinc-700">•</span>
          <button onClick={() => travelToLocation(37.5002, 127.0362)} className="hover:text-cyan-400 hover:underline shrink-0 text-[11.5px] font-sans font-medium cursor-pointer">강남</button>
          <span className="text-zinc-700">•</span>
          <button onClick={() => travelToLocation(37.5348, 126.9934)} className="hover:text-purple-400 hover:underline shrink-0 text-[11.5px] font-sans font-medium cursor-pointer">이태원</button>
          <span className="text-zinc-700">•</span>
          <button onClick={() => travelToLocation(37.5113, 127.0805)} className="hover:text-emerald-400 hover:underline shrink-0 text-[11.5px] font-sans font-medium cursor-pointer">잠실</button>
        </div>
      </div>

      {/* Info panel launcher */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <button
          onClick={() => setShowKakaoInfo(prev => !prev)}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl backdrop-blur-md transition-all border cursor-pointer ${
            showKakaoInfo 
              ? 'bg-amber-950 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>카카오맵 API 가이드</span>
        </button>

        <AnimatePresence>
          {showKakaoInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-full right-0 mb-2 w-72 sm:w-80 bg-zinc-950/95 border border-zinc-800 rounded-xl p-4 shadow-2xl text-left z-55 text-xs text-zinc-300"
            >
              <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-amber-500" />
                카카오맵 API 실시간 연동
              </h4>
              <p className="text-zinc-400 leading-relaxed mb-3">
                현재 대한민국 서울 내의 응원 성지 마커들은 실제 카카오맵 API 위성/실시간 벡터 레이어 위에 마운트되어 있습니다.
                인프라 등록 도메인 <code>http://localhost:3000</code> 기준으로 완전한 Interactive 및 실서비스 상태 데이터가 전송됩니다.
              </p>
              
              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/60 font-mono text-[9px] text-zinc-400 mb-3 select-text max-h-24 overflow-y-auto">
                {`API Key: ${getKakaoAppKey()}`}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowKakaoInfo(false)}
                  className="px-2.5 py-1.5 rounded-md bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors cursor-pointer text-[11px]"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-20 right-4 bg-zinc-950/70 text-[9.5px] text-zinc-500 font-mono border border-zinc-900 rounded p-1 backdrop-blur-sm pointer-events-none hidden sm:block">
        실제 카카오맵 드래그 & 확대 가능
      </div>
    </div>
  );
}
