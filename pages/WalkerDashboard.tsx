
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, WalkRequest, Application, WalkStatus, Dog, ApplicationStatus } from '../types.ts';
import { supabase } from '../supabase.ts';
import StatusBadge from '../components/StatusBadge.tsx';

interface Props {
  user: User;
  requests: WalkRequest[];
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  setRequests: React.Dispatch<React.SetStateAction<WalkRequest[]>>;
  dogs: Dog[];
  onRefresh: () => Promise<void>;
}

const WalkerDashboard: React.FC<Props> = ({ user, requests, applications, onRefresh }) => {
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  const myApplications = applications.filter(a => a.walkerId === user.id);
  const myMatchedWalks = requests.filter(req => 
    req.status === WalkStatus.MATCHED &&
    myApplications.some(a => a.requestId === req.id && a.status === ApplicationStatus.ACCEPTED)
  );
  const availableRequests = requests.filter(r => r.status === WalkStatus.OPEN && r.ownerId !== user.id);
  const completedWalks = requests.filter(req => 
    req.status === WalkStatus.COMPLETED &&
    myApplications.some(a => a.requestId === req.id && a.status === ApplicationStatus.ACCEPTED)
  );

  const totalEarnings = completedWalks.reduce((acc, curr) => acc + curr.reward, 0);

  const handleApply = async (requestId: string) => {
    setApplyingId(requestId);
    try {
      const { error } = await supabase.from('applications').insert({
        request_id: requestId,
        walker_id: user.id,
        status: ApplicationStatus.PENDING
      });
      if (error) throw error;
      alert('지원 완료!');
      await onRefresh();
    } catch (error: any) {
      alert('지원 실패: ' + error.message);
    } finally {
      setApplyingId(null);
    }
  };

  const executeComplete = async (requestId: string) => {
    setShowConfirmModal(null);
    setCompletingId(requestId);
    try {
      const { data, error } = await supabase
        .from('walk_requests')
        .update({ status: WalkStatus.COMPLETED })
        .eq('id', requestId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        alert('업데이트 권한이 없거나 오류가 발생했습니다. DB 설정을 확인해주세요.');
        return;
      }
      alert('산책 완료 처리가 되었습니다!');
      await onRefresh();
    } catch (error: any) {
      alert('상태 업데이트 실패: ' + error.message);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Custom Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-2xl mx-auto">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-800">산책을 완료하셨나요?</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">완료 처리 후에는 상태를 변경할 수 없으며,<br/>견주님께 정산 요청이 전달됩니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirmModal(null)} className="py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={() => executeComplete(showConfirmModal)} className="py-4 bg-green-500 text-white font-black rounded-2xl shadow-lg shadow-green-100 hover:bg-green-600 transition-all">네, 완료했어요!</button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800">안녕하세요, {user.nickname} 프로님!</h1>
          <p className="text-slate-500 mt-1">오늘도 강아지들과 행복한 발걸음 되세요. 🐾</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">총 수입</p>
            <p className="text-xl font-black text-orange-500">{totalEarnings.toLocaleString()}원</p>
          </div>
          <div className="w-[1px] h-8 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">산책 횟수</p>
            <p className="text-xl font-black text-slate-800">{completedWalks.length}회</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><i className="fas fa-calendar-check text-green-500"></i> 오늘의 산책 일정</h2>
          {myMatchedWalks.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center text-slate-400">확정된 산책 일정이 없습니다.</div>
          ) : (
            myMatchedWalks.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 transition-all hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl overflow-hidden shrink-0">
                      {req.dog?.imageUrl ? <img src={req.dog.imageUrl} className="w-full h-full object-cover" /> : '🐶'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{req.dog?.name} · {req.duration}분</h4>
                      <p className="text-sm text-slate-500">{new Date(req.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <button 
                  disabled={completingId === req.id}
                  onClick={() => setShowConfirmModal(req.id)}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {completingId === req.id ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-check-circle"></i> 산책 완료 처리하기</>}
                </button>
              </div>
            ))
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><i className="fas fa-search-location text-orange-400"></i> 실시간 동네 산책</h2>
          {availableRequests.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center text-slate-400">근처에 새로운 공고가 없습니다.</div>
          ) : (
            availableRequests.slice(0, 5).map(req => (
              <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 font-black overflow-hidden shrink-0">
                    {req.dog?.imageUrl ? <img src={req.dog.imageUrl} className="w-full h-full object-cover" /> : '🐶'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{req.dog?.name} ({req.dog?.breed})</h4>
                    <p className="text-xs text-slate-400">{req.duration}분 · {req.reward.toLocaleString()}원</p>
                  </div>
                </div>
                <button 
                  disabled={myApplications.some(a => a.requestId === req.id) || applyingId === req.id}
                  onClick={() => handleApply(req.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${myApplications.some(a => a.requestId === req.id) ? 'bg-slate-100 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                >
                  {applyingId === req.id ? <i className="fas fa-spinner animate-spin"></i> : (myApplications.some(a => a.requestId === req.id) ? '지원됨' : '지원')}
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default WalkerDashboard;
