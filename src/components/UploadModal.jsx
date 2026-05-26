import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, AlertCircle, Sparkles, X, Info, Check } from 'lucide-react';
import { parseCSVToPlaces, validateAndMapToPlace } from '../utils/geoUtils';

export default function UploadModal({ onClose, onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successCount, setSuccessCount] = useState(null);
  const fileInputRef = useRef(null);

  // Sample CSV / JSON Template texts for the user
  const sampleCSV = `name,latitude,longitude,atmosphere,crowd_level,screen_size,solo_friendly,reservation_required,address
"신촌 낭만오지",37.5583,126.9345,"대형 프로젝터/분위기 맛집",moderate,"120인치",true,false,"서울특별시 서대문구 연세로7안길 10-1"
"홍대 만선호프",37.5557,126.9232,"을지로 야장 감성/초대형 스크린 3개",critical,"200인치 대형 스크린",true,false,"서울특별시 마포구 어울마당로 124"
"압구정 축구 광장",37.5265,127.0270,"진성 붉은악마 소굴/네온사인",high,"80인치 TV",false,true,"서울특별시 강남구 압구정로"`;

  const sampleJSON = `[
  {
    "name": "성수 아레나 맥주 스타디움",
    "latitude": 37.545,
    "longitude": 127.056,
    "atmosphere": "축구 응원 전야제/대규모 경기 중계",
    "crowd_level": "critical",
    "screen_size": "250인치 멀티 빔 프로젝터",
    "solo_friendly": true,
    "reservation_required": false,
    "address": "서울특별시 성동구 성수동 123"
  }
]`;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    setErrorMsg(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result;
      if (!text) {
        setErrorMsg('파일을 읽어오는데 실패했습니다.');
        return;
      }

      try {
        let importedCount = 0;
        let pList = [];

        if (file.name.endsWith('.json')) {
          // Process JSON
          const parsed = JSON.parse(text);
          const rawList = Array.isArray(parsed) ? parsed : [parsed];
          
          pList = rawList.map((raw, index) => {
            const mappedRaw = {
              name: raw.name || raw.placeName || raw.title,
              latitude: parseFloat(raw.latitude || raw.lat || '37.55'),
              longitude: parseFloat(raw.longitude || raw.lng || '126.93'),
              description: raw.description || raw.desc,
              imageUrl: raw.image || raw.imageUrl,
              screenSize: raw.screen_size || raw.screenSize || raw.screen,
              soloFriendly: raw.solo_friendly !== false && raw.soloFriendly !== false,
              reservationRequired: !!(raw.reservation_required || raw.reservationRequired),
              atmosphereTags: typeof raw.atmosphere === 'string' 
                ? [raw.atmosphere] 
                : Array.isArray(raw.atmosphere) 
                ? raw.atmosphere 
                : raw.atmosphereTags || ['응원 맛집'],
              crowdLevel: raw.crowd_level || raw.crowdLevel || 'moderate',
              address: raw.address || raw.location
            };
            return validateAndMapToPlace(mappedRaw, index);
          });
          importedCount = pList.length;

        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          // Process CSV
          const rawList = parseCSVToPlaces(text);
          pList = rawList.map((raw, idx) => validateAndMapToPlace(raw, idx));
          importedCount = pList.length;
        } else {
          setErrorMsg('지원하지 않는 파일 형식입니다. CSV 또는 JSON 파일만 업로드해주세요.');
          return;
        }

        if (importedCount === 0) {
          setErrorMsg('유효한 장소 데이터 핀을 찾을 수 없습니다.');
        } else {
          setSuccessCount(importedCount);
          onImportSuccess(pList);
          setTimeout(() => {
            onClose();
          }, 1500);
        }

      } catch (err) {
        console.error(err);
        setErrorMsg(`데이터 해석 오류: ${err.message || '포맷을 다시 확인해주세요.'}`);
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('양식이 클립보드에 복사되었습니다! 메모장에 이 파일을 복사해 CSV나 JSON으로 저장해보세요.');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl text-left"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-2 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-red-500/10 p-2.5 rounded-2xl border border-red-500/20">
            <Upload className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">응원장소 핀 데이터 대량 업로드</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              술집, 펍, 치맥점 데이터를 CSV 또는 JSON 파일로 일괄 로드하여 월드컵맵의 네온 핀을 증식시키세요!
            </p>
          </div>
        </div>

        {/* Drag n Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-red-500 bg-red-950/10' 
              : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/30'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".csv,.json,.txt"
            className="hidden" 
          />
          
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="bg-zinc-800 p-3 rounded-full mb-1">
              <FileText className="w-6 h-6 text-zinc-400" />
            </div>
            {successCount !== null ? (
              <div className="flex flex-col items-center gap-1">
                <Check className="w-8 h-8 text-emerald-500 mb-1" />
                <p className="text-emerald-400 text-sm font-bold">임포트 성공!</p>
                <p className="text-xs text-zinc-400 font-medium">총 {successCount}개의 월드컵 아레나가 추가되었습니다.</p>
              </div>
            ) : errorMsg ? (
              <div className="flex flex-col items-center gap-1">
                <AlertCircle className="w-8 h-8 text-red-500 mb-1" />
                <p className="text-red-400 text-xs font-semibold">{errorMsg}</p>
                <p className="text-[11px] text-zinc-500">클릭하여 다시 시도해보세요.</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-zinc-200">
                  파일을 여기에 끌어다 놓거나 클릭하여 선택
                </p>
                <p className="text-xs text-zinc-500">
                  지원 규격: JSON (*.json), CSV (*.csv, *.txt)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Instructions & Copy Template buttons */}
        <div className="mt-6 border-t border-zinc-900 pt-5">
          <h4 className="text-xs font-semibold uppercase text-zinc-400 font-mono tracking-wider flex items-center gap-1 mb-3">
            <Info className="w-3.5 h-3.5 text-zinc-400" />
            업로드 규격 미리보기 및 템플릿 복사
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CSV card preview */}
            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-400 font-mono">CSV (.csv) FORMAT</span>
                <button 
                  onClick={() => copyToClipboard(sampleCSV)}
                  className="text-[10px] bg-zinc-800 font-mono border border-zinc-700 px-2 py-0.5 rounded text-zinc-300 hover:text-white"
                >
                  양식 복사
                </button>
              </div>
              <pre className="text-[9px] font-mono text-zinc-500 overflow-x-auto p-2 bg-black/40 rounded leading-tight max-h-24">
                {sampleCSV}
              </pre>
            </div>

            {/* JSON card preview */}
            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-cyan-400 font-mono">JSON (.json) FORMAT</span>
                <button 
                  onClick={() => copyToClipboard(sampleJSON)}
                  className="text-[10px] bg-zinc-800 font-mono border border-zinc-700 px-2 py-0.5 rounded text-zinc-300 hover:text-white"
                >
                  양식 복사
                </button>
              </div>
              <pre className="text-[9px] font-mono text-zinc-500 overflow-x-auto p-2 bg-black/40 rounded leading-tight max-h-24">
                {sampleJSON}
              </pre>
            </div>
          </div>

          <div className="mt-4 bg-red-950/10 border border-red-500/10 p-3 rounded-xl flex gap-2">
            <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-zinc-400 leading-normal">
              <strong>자동 좌표계 치환 설계:</strong> 업로드 시 위도(latitude), 경도(longitude) 값을 읽어내어,
              메인 다크 전술 지도의 적절한 2D 격자 백분율 퍼센트(x, y)로 자율 투사하며 권역을 자동 추론 분리 마킹합니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
