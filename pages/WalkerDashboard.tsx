
import React from 'react';
import { Link } from 'react-router-dom';
import { User, WalkRequest, Application, WalkStatus, Dog } from '../types.ts';
import StatusBadge from '../components/StatusBadge.tsx';

interface Props {
  user: User;
  requests: WalkRequest[];
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  setRequests: React.Dispatch<React.SetStateAction<WalkRequest[]>>;
  dogs: Dog[];
}

const WalkerDashboard: React.FC<Props> = ({ user, requests, applications, setApplications, setRequests, dogs }) => {
  const myApplications = applications.filter(a => a.walkerId === user.id);
  const myMatchedWalks = requests.filter(req => 
    myApplications.some(a => a.requestId === req.id && a.status === 'ACCEPTED' && req.status === WalkStatus.MATCHED)
  );
  const availableRequests = requests.filter(r => r.status === WalkStatus.OPEN && r.ownerId !== user.id);
  const completedWalks = requests.filter(req => 
    myApplications.some(a => a.requestId === req.id && a.status === 'ACCEPTED' && req.status === WalkStatus.COMPLETED)
  );

  const totalEarnings = completedWalks.reduce((acc, curr) => acc + curr.reward, 0);

  const handleApply = (requestId: string) => {
    if (myApplications.some(a => a.requestId === requestId)) {
      alert('이미 지원한 산책입니다.');
      return;
    }
    const newApp: Application = {
      id: `app_${Date.now()}`,
      requestId,
      walkerId: user.id,
      status: 'PENDING' as any,
      createdAt: new Date().toISOString()
    };
    setApplications(prev => [...prev, newApp]);
    alert('지원 완료! 견주님의 선택을 기다려주세요.');
  };

  const handleComplete = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: WalkStatus.COMPLETED } : req
    ));
    alert('산책 완료! 정산이 진행됩니다.');
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800">안녕하세요, {user.nickname} 프로님!</h1>
          <p className="text-slate-500 mt-1">오늘도 강아지들과 행복한 발걸음 되세요. 🐾</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
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
        {/* 2. 확정된 일정 (Matched) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-calendar-check text-green-500"></i>
            오늘의 산책 일정
          </h2>
          {myMatchedWalks.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <p className="text-slate-400 font-medium">확정된 산책 일정이 없습니다.</p>
              <Link to="/list" className="text-sm text-green-600 font-bold mt-2 inline-block">주변 산책 찾아보기</Link>
            </div>
          ) : (
            myMatchedWalks.map(req => {
              const dog = dogs.find(d => d.id === req.dogId);
              return (
                <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl">🐶</div>
                      <div>
                        <h4 className="font-bold text-slate-800">{dog?.name} · {req.duration}분</h4>
                        <p className="text-sm text-slate-500">{new Date(req.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <button 
                    onClick={() => handleComplete(req.id)}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all"
                  >
                    산책 완료 처리하기
                  </button>
                </div>
              )
            })
          )}
        </section>

        {/* 3. 추천 산책 (Open) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-search-location text-orange-400"></i>
              실시간 동네 산책
            </h2>
            <Link to="/list" className="text-sm text-slate-400 hover:text-slate-600">전체보기 <i className="fas fa-chevron-right text-[10px]"></i></Link>
          </div>
          {availableRequests.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <p className="text-slate-400 font-medium">근처에 새로운 공고가 없습니다.</p>
            </div>
          ) : (
            availableRequests.slice(0, 3).map(req => {
              const dog = dogs.find(d => d.id === req.dogId);
              const isApplied = myApplications.some(a => a.requestId === req.id);
              return (
                <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 font-black">
                      {dog?.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{dog?.name} ({dog?.breed})</h4>
                      <p className="text-xs text-slate-400">{req.duration}분 · {req.reward.toLocaleString()}원</p>
                    </div>
                  </div>
                  <button 
                    disabled={isApplied}
                    onClick={() => handleApply(req.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isApplied ? 'bg-slate-100 text-slate-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                  >
                    {isApplied ? '지원됨' : '지원'}
                  </button>
                </div>
              )
            })
          )}
        </section>
      </div>
    </div>
  );
};

export default WalkerDashboard;
