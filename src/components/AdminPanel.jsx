import React from 'react';
import { 
  CheckCircle, XCircle, AlertCircle, Clock, Trash2, 
  MapPin, ShieldCheck, Tv, Trophy, Sparkles
} from 'lucide-react';

export default function AdminPanel({
  submissions,
  onApprove,
  onReject,
  onDeleteSubmission
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 md:p-6 shadow-2xl">
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 mb-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-red-500 font-sans tracking-tight flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            월드컵맵 제보 승인 관리 통제실 (Admin Console)
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            유저들이 실시간 제보 양식을 통해 신청한 월드컵 중계 주점이 대기하는 장소입니다. 허위 등록 및 비속어를 검열하여 성전의 신뢰도를 사수하세요.
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5 self-start sm:self-center">
          <span className="text-[10px] font-mono tracking-wider font-semibold text-red-400 uppercase">
            대기 행렬: {submissions.filter(s => s.status === 'pending').length}건
          </span>
        </div>
      </div>

      {/* Main flow */}
      {submissions.length === 0 ? (
        <div className="text-center py-10 border border-zinc-900 border-dashed rounded-xl bg-zinc-900/10">
          <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-zinc-400">대기중인 제보 내역이 완전히 비어있습니다.</p>
          <p className="text-xs text-zinc-500 mt-1">상단의 "여기 중계해요! (제보하기)" 버튼을 눌러 테스트용 데이터를 제보해 보십시오!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {submissions.map((sub) => {
            const isPending = sub.status === 'pending';
            const isApproved = sub.status === 'approved';
            const isRejected = sub.status === 'rejected';

            return (
              <div 
                key={sub.id}
                className={`border rounded-xl p-4 transition-all flex flex-col md:flex-row gap-4 justify-between bg-black/45 ${
                  isPending 
                    ? 'border-zinc-800 hover:border-zinc-700' 
                    : isApproved 
                    ? 'border-emerald-500/20 bg-emerald-950/5' 
                    : 'border-rose-500/20 bg-rose-950/5'
                }`}
              >
                {/* Thumbnail and content descriptions */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden shrink-0 border border-zinc-900 bg-zinc-900">
                    <img 
                      src={sub.imageUrl} 
                      alt={sub.placeName} 
                      className="w-full h-full object-cover opacity-85"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-zinc-200 truncate">{sub.placeName}</h4>
                      <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded leading-none uppercase font-mono font-bold">
                        {sub.category === 'pub' ? '펍' : sub.category === 'chicken' ? '치맥' : '광장'}
                      </span>
                      
                      {/* State Pill */}
                      {isPending && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 leading-none">
                          <Clock className="w-3 h-3" />
                          승인 대기중
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 leading-none">
                          <CheckCircle className="w-3 h-3" />
                          발행 완료
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 leading-none">
                          <XCircle className="w-3 h-3" />
                          제보 거절됨
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{sub.address}</span>
                    </p>

                    <p className="text-[11px] text-zinc-500 leading-normal">
                      {sub.description}
                    </p>

                    {/* Metadata indicators */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded">
                        🖥️ {sub.screenSize}
                      </span>
                      <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded">
                        {sub.reservationRequired ? '⭕ 예약필수' : '❌ 예약 불필요'}
                      </span>
                      <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded font-medium text-red-400">
                        🔗 {sub.instagramUrl ? '인스타 완료' : '인스타 누락'}
                      </span>
                      {sub.atmosphereTags.map(tag => (
                        <span key={tag} className="text-[10px] text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Operations buttons */}
                <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 md:min-w-28 self-end md:self-center border-t border-zinc-900 md:border-none pt-3 md:pt-0 w-full md:w-auto">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onApprove(sub.id)}
                        className="flex-1 md:w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>승인(지도공개)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(sub.id)}
                        className="flex-1 md:w-full py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-900/30 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>보류/거절</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDeleteSubmission(sub.id)}
                      className="flex-1 md:w-full py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-red-950/30 text-zinc-500 hover:text-red-400 border border-zinc-850 hover:border-red-900/30 text-xs transition-colors flex items-center justify-center gap-1"
                      title="데이터베이스 영구 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>레코드 삭제</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
