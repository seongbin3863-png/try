import React from 'react';
import { 
  Trophy, SlidersHorizontal, Map, Check, RefreshCw, Sparkles, AlertCircle
} from 'lucide-react';
import { REGIONS, CATEGORY_DETAILS } from '../sampleData';

export default function FilterBar({
  filters,
  onChangeFilters,
  onResetFilters,
  activeFiltersCount
}) {
  
  const handleToggleSolo = () => {
    onChangeFilters({ ...filters, soloFriendlyOnly: !filters.soloFriendlyOnly });
  };

  const handleToggleNoReserve = () => {
    onChangeFilters({ ...filters, noReservationNeeded: !filters.noReservationNeeded });
  };

  const handleToggleOutdoor = () => {
    onChangeFilters({ ...filters, outdoorOnly: !filters.outdoorOnly });
  };

  const handleToggleCritical = () => {
    onChangeFilters({ ...filters, criticalOnly: !filters.criticalOnly });
  };

  return (
    <div id="filter-bar-container" className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 md:p-5 shadow-xl">
      {/* Region Scrolling Selector */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-zinc-500 uppercase font-mono tracking-wider block mb-2 px-1">
          📍 광역 원정 타겟 지역 (서울)
        </label>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {REGIONS.map((r) => {
            const isSelected = filters.region === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => onChangeFilters({ ...filters, region: r.value })}
                className={`text-xs px-3.5 py-2 rounded-xl transition-all border shrink-0 whitespace-nowrap font-medium ${
                  isSelected 
                    ? 'bg-red-650 border-red-500 text-white font-semibold shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category selector */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-zinc-500 uppercase font-mono tracking-wider block mb-2 px-1">
          📢 응원 스타일 테마
        </label>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => onChangeFilters({ ...filters, category: 'all' })}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
              filters.category === 'all'
                ? 'bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-900 hover:border-zinc-800 hover:text-zinc-200'
            }`}
          >
            전체 스타일
          </button>
          {Object.entries(CATEGORY_DETAILS).map(([key, value]) => {
            if (key === 'all') return null;
            const isSelected = filters.category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChangeFilters({ ...filters, category: key })}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  isSelected
                    ? 'bg-red-950/80 text-red-200 border-red-600/50 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-900 hover:border-zinc-800'
                }`}
              >
                {value.label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-zinc-900 my-4" />

      {/* Atmospheric Toggles & Intensity sliders */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sliders for vocal volume */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase font-mono tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-zinc-500" />
              최소 응원 데시벨 지수
            </span>
            <span className="text-xs font-mono font-bold text-red-400">{filters.minCheer}% 이상</span>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="0" 
              max="90" 
              step="10"
              value={filters.minCheer}
              onChange={(e) => onChangeFilters({ ...filters, minCheer: parseInt(e.target.value) })}
              className="w-full accent-red-600 bg-zinc-900 h-1.5 rounded-lg cursor-pointer appearance-none"
            />
            <span className="text-[10px] font-mono text-zinc-500 select-none">90%</span>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Solo Spot */}
          <button
            type="button"
            onClick={handleToggleSolo}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all border ${
              filters.soloFriendlyOnly 
                ? 'bg-red-950/60 text-red-400 border-red-800/40' 
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.soloFriendlyOnly ? 'bg-red-400' : 'bg-transparent border border-zinc-600'}`} />
            <span>👤 혼자 갈래요</span>
          </button>

          {/* Direct view Spots */}
          <button
            type="button"
            onClick={handleToggleOutdoor}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all border ${
              filters.outdoorOnly 
                ? 'bg-red-950/60 text-red-400 border-red-800/40' 
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.outdoorOnly ? 'bg-red-400' : 'bg-transparent border border-zinc-600'}`} />
            <span>🌃 야외 응원 광장</span>
          </button>

          {/* No bookings */}
          <button
            type="button"
            onClick={handleToggleNoReserve}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all border ${
              filters.noReservationNeeded 
                ? 'bg-red-950/60 text-red-400 border-red-800/40' 
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.noReservationNeeded ? 'bg-red-400' : 'bg-transparent border border-zinc-600'}`} />
            <span>⚡ 예약 불필요</span>
          </button>

          {/* Crazy hot spots */}
          <button
            type="button"
            onClick={handleToggleCritical}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all border ${
              filters.criticalOnly 
                ? 'bg-rose-950/70 text-rose-400 border-rose-800/40 font-semibold' 
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filters.criticalOnly ? 'bg-rose-400 animate-pulse' : 'bg-transparent border border-zinc-600'}`} />
            <span>🔥 현재 대혼잡/핫플</span>
          </button>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>초기화 ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
