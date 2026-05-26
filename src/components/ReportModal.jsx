import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, Check, AlertCircle, UploadCloud, Info, MapPin, 
  Tv, Sparkles, Send
} from 'lucide-react';
import { ATMOSPHERE_TAGS_POOL, REGIONS } from '../sampleData';

export default function ReportModal({
  onClose,
  onSubmit
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState('gwanghwamun');
  const [category, setCategory] = useState('pub');
  const [screenSize, setScreenSize] = useState('150인치 대형 스크린');
  const [reservationRequired, setReservationRequired] = useState(false);
  const [soloFriendly, setSoloFriendly] = useState(true);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [naverMapUrl, setNaverMapUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // Custom multi-select atmosphere tags
  const [selectedTags, setSelectedTags] = useState(['축덕 많음']);
  const [activeTab, setActiveTab] = useState('info');

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Form error notification
  const [errorMsg, setErrorMsg] = useState('');

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= 5) {
        alert('태그는 최대 5개까지 선택 가능합니다!');
        return;
      }
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Image upload simulator (Base64 conversion)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일포맷만 지원합니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('장소 이름을 입력해주세요.');
      setActiveTab('info');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('위치 주소를 입력해 주셔야 핀 배치가 가능합니다.');
      setActiveTab('info');
      return;
    }
    if (selectedTags.length === 0) {
      setErrorMsg('분위기 태그를 최소 1개 이상 지정해 주세요.');
      setActiveTab('tags');
      return;
    }

    const mockImage = imageFile || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80';

    onSubmit({
      placeName: name,
      address,
      region,
      category,
      atmosphereTags: selectedTags,
      screenSize,
      reservationRequired,
      soloFriendly,
      instagramUrl: instagramUrl.trim() || 'https://instagram.com',
      naverMapUrl: naverMapUrl.trim() || `https://map.naver.com/v5/search/${encodeURIComponent(name)}`,
      description: description.trim() || `${name}은 응원 가능한 열기 넘치는 스포츠 거점 공간입니다.`,
      imageUrl: mockImage
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100 p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Banner red header */}
        <div className="bg-gradient-to-r from-red-800 to-rose-950 p-5 shrink-0 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              새로운 응원 성지 제보센터
            </h3>
            <p className="text-zinc-300 text-[11px] font-medium mt-0.5">
              축구를 다 같이 볼 수 있는 술집, 야장, 치킨집을 소유주/팬 자격으로 제보해 보세요!
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-zinc-300 hover:text-white rounded-lg p-1.5 bg-black/25 border border-white/5 hover:bg-black/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Tab list navigator */}
        <div className="flex border-b border-zinc-900 bg-zinc-900/40 text-xs text-zinc-400 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 text-center py-3 font-semibold transition-all ${activeTab === 'info' ? 'border-b-2 border-red-500 text-red-400 bg-zinc-950' : 'hover:text-zinc-300'}`}
          >
            1. 기본 정보
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={`flex-1 text-center py-3 font-semibold transition-all ${activeTab === 'tags' ? 'border-b-2 border-red-500 text-red-400 bg-zinc-950' : 'hover:text-zinc-300'}`}
          >
            2. 태그 선정 ({selectedTags.length}개)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`flex-1 text-center py-3 font-semibold transition-all ${activeTab === 'photo' ? 'border-b-2 border-red-500 text-red-400 bg-zinc-950' : 'hover:text-zinc-300'}`}
          >
            3. 이미지 등록
          </button>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tabs Contents inside Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* TAB 1: Base info */}
          {activeTab === 'info' && (
            <div className="space-y-3">
              <div>
                <label className="text-zinc-400 font-semibold mb-1 block">장소 이름 (필수)</label>
                <input 
                  type="text" 
                  required
                  placeholder="예: 홍대 붉은악마 축구포차"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrorMsg(''); }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-semibold mb-1 block">행정 구역 구분</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-red-500 text-xs"
                  >
                    {REGIONS.filter(r => r.value !== 'all').map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold mb-1 block">응원 형태 분류</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-red-500 text-xs"
                  >
                    <option value="pub">스포츠 펍</option>
                    <option value="chicken">치킨집/호프집</option>
                    <option value="plaza">야외광장/야장</option>
                    <option value="cinema">대형 스크린 전용관</option>
                    <option value="lounge">루프탑/라운지</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold mb-1 block">도로명 상세주소 (필수)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="서울특별시 마포구 와우산로..."
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setErrorMsg(''); }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 pl-8 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs"
                  />
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 bg-zinc-900/50 p-2.5 border border-zinc-900 rounded-lg cursor-pointer hover:bg-zinc-900">
                  <input 
                    type="checkbox"
                    checked={reservationRequired}
                    onChange={(e) => setReservationRequired(e.target.checked)}
                    className="accent-red-600 rounded text-red-600"
                  />
                  <div>
                    <span className="text-zinc-300 font-medium block">사전 예약 필수 여부</span>
                    <span className="text-[10px] text-zinc-500">지정석 예약 운영 장소인 경우 체크</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 bg-zinc-900/50 p-2.5 border border-zinc-900 rounded-lg cursor-pointer hover:bg-zinc-900">
                  <input 
                    type="checkbox"
                    checked={soloFriendly}
                    onChange={(e) => setSoloFriendly(e.target.checked)}
                    className="accent-red-600 rounded text-red-600"
                  />
                  <div>
                    <span className="text-zinc-300 font-medium block">1인(혼자) 응원 가능</span>
                    <span className="text-[10px] text-zinc-500">혼자 가도 완전 자연스러운 공간</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold mb-1 block">스크린 장비 크기 규격</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="예: 200인치 고화질 빔 프로젝터 구비"
                    value={screenSize}
                    onChange={(e) => setScreenSize(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 pl-8 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs"
                  />
                  <Tv className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold mb-1 block">맛집 인스타 프로필 연동 (선택)</label>
                  <input 
                    type="text" 
                    placeholder="인스타 링크 주소"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold mb-1 block">네이버 지도 링크 연동 (선택)</label>
                  <input 
                    type="text" 
                    placeholder="지도 상 상세 링크"
                    value={naverMapUrl}
                    onChange={(e) => setNaverMapUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold mb-1 block">매장 및 중계 정보 한줄 소개</label>
                <textarea 
                  rows={2}
                  placeholder="대형 소파 구비 완료! 목청껏 치맥 응원 가능한 분위기로, 매 경기가 성행합니다."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('tags')}
                className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 mt-2 rounded-lg font-semibold transition-all border border-zinc-800"
              >
                다음 단계: 분위기 해시태그 설정 정보 지정란으로 이동 →
              </button>
            </div>
          )}

          {/* TAB 2: Tags pool selection */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 flex items-start gap-2 text-zinc-400">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  해당 매장이 가지고 있는 독점적이고 유니크한 분위기 태그를 <strong className="text-red-400">최대 5개까지</strong> 골라주세요. 다중 선정이 성지와 가고 싶게 하는 FOMO를 높여줍니다!
                </p>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold mb-2 block">제공 태그 전체 풀 (선택 시 하이라이트)</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1.5 border border-zinc-900 rounded-xl bg-black/45">
                  {ATMOSPHERE_TAGS_POOL.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => { toggleTag(tag); setErrorMsg(''); }}
                        className={`text-left p-2 rounded-lg border text-[11px] transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-red-950/60 border-red-500/50 text-red-300 font-semibold'
                            : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span>#{tag}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 font-bold block mb-1">선택 완료된 태그 묶음:</span>
                <div className="flex flex-wrap gap-1.5 min-h-8 p-2 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/20">
                  {selectedTags.length === 0 ? (
                    <span className="text-zinc-600 text-[10px]">지정된 태그가 없습니다. 위 목록에서 터치하여 추가하세요.</span>
                  ) : (
                    selectedTags.map(tag => (
                      <span key={tag} className="bg-red-950/40 text-red-400 border border-red-900/30 px-2 py-0.5 rounded text-[11px]">
                        #{tag}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg transition-colors border border-zinc-800"
                >
                  ← 이전 단계 정보 수정
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('photo')}
                  className="flex-1 py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 rounded-lg transition-colors border border-zinc-800"
                >
                  다음 단계: 매장 전경 사진 등록 →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Spot Photo input and simulation */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
                  dragOver 
                    ? 'border-red-500 bg-red-950/10' 
                    : imageFile 
                    ? 'border-emerald-500 bg-emerald-950/5' 
                    : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                }`}
                onClick={triggerFileSelect}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {imageFile ? (
                  <div className="space-y-3 w-full">
                    <img 
                      src={imageFile} 
                      alt="Uploaded preview" 
                      className="w-full h-24 object-cover rounded-lg border border-zinc-800 max-w-[240px] mx-auto shadow-md"
                    />
                    <div>
                      <p className="text-zinc-200 font-semibold text-[11px]">사진 등록 완료!</p>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImageFile(null); }}
                        className="text-[10px] text-red-400 underline hover:text-red-300 mt-0.5"
                      >
                        사진 초기화 및 새로 올리기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto animate-bounce" />
                    <div>
                      <p className="text-zinc-300 font-semibold text-[11.5px]">이곳을 클릭하거나 이미지 파일을 드래그하십시오</p>
                      <p className="text-zinc-500 text-[10px] mt-1">지원 규격: JPG, PNG, WEBP (최대 4MB)</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded-xl">
                <h5 className="font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  제보 승인 보증
                </h5>
                <p className="text-zinc-500 text-[10.5px] leading-relaxed">
                  작성된 제보는 허위 정보 필터링을 방지하기 위해 <strong className="text-amber-400">관리자 승인 대기소</strong>로 최초 회신됩니다. 화면 상단의 관리자 탭에서 승인 버튼을 위조 체크해 볼 수 있습니다!
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('tags')}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg transition-colors border border-zinc-800"
                >
                  ← 이전 분위기 선택지
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all shadow-[0_0_12px_rgba(220,38,38,0.4)] flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>제보 등록 완료하기</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
