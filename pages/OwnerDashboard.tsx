
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, WalkRequest, Application, WalkStatus, Dog, ApplicationStatus } from '../types.ts';
import { supabase } from '../supabase.ts';
import StatusBadge from '../components/StatusBadge.tsx';

interface Props {
  user: User;
  requests: WalkRequest[];
  applications: Application[];
  setRequests: React.Dispatch<React.SetStateAction<WalkRequest[]>>;
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  dogs: Dog[];
  allUsers: User[];
  onRefresh: () => Promise<void>;
}

const OwnerDashboard: React.FC<Props> = ({ user, requests, applications, dogs, onRefresh }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const ownerRequests = requests.filter(r => r.ownerId === user.id);
  const matchedRequests = ownerRequests.filter(r => r.status === WalkStatus.MATCHED);
  const openRequests = ownerRequests.filter(r => r.status === WalkStatus.OPEN);

  const handleAcceptApplication = async (requestId: string, appId: string) => {
    setLoadingId(appId);
    try {
      // 1. 공고 상태를 MATCHED로 변경
      const { error: reqError } = await supabase
        .from('walk_requests')
        .update({ status: WalkStatus.MATCHED })
        .eq('id', requestId);

      if (reqError) throw reqError;

      // 2. 해당 지원서는 ACCEPTED로 변경
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: ApplicationStatus.ACCEPTED })
        .eq('id', appId);

      if (appError) throw appError;

      // 3. 나머지 지원서는 REJECTED로 변경 (선택사항)
      await supabase
        .from('applications')
        .update({ status: ApplicationStatus.REJECTED })
        .eq('request_id', requestId)
        .neq('id', appId);

      alert('산책러 매칭이 완료되었습니다!');
      await onRefresh();
    } catch (error: any) {
      alert('매칭 실패: ' + error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">반가워요, {user.nickname}님!</h1>
          <p className="text-slate-500 mt-1">오늘도 댕댕이들과 행복한 하루 되세요. 🐾</p>
        </div>
        <Link 
          to="/request/new" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-orange-100 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95"
        >
          <i className="fas fa-calendar-plus"></i>
          새 산책 예약하기
        </Link>
      </div>

      {/* 2. My Dogs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-dog text-orange-400"></i>
            내 반려견 정보
          </h2>
          <Link to="/dog/new" className="text-sm font-bold text-orange-500 hover:underline">추가 등록</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {dogs.length === 0 ? (
            <div className="w-full bg-white p-10 rounded-3xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 mb-4">등록된 반려견이 없습니다.</p>
              <Link to="/dog/new" className="text-orange-500 font-bold border border-orange-500 px-4 py-2 rounded-xl">첫 반려견 등록하기</Link>
            </div>
          ) : (
            dogs.map(dog => (
              <div key={dog.id} className="min-w-[280px] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-orange-200 transition-colors">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                  {dog.imageUrl ? (
                    <img src={dog.imageUrl} alt={dog.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🐶</span>
                  )}
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-slate-800 text-lg truncate">{dog.name}</h3>
                  <p className="text-sm text-slate-400">{dog.breed} · {dog.size}형견</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. 진행 중인 산책 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-clock text-blue-400"></i>
            매칭된 산책 일정
          </h2>
          {matchedRequests.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <p className="text-slate-400 font-medium">현재 매칭된 산책이 없습니다.</p>
            </div>
          ) : (
            matchedRequests.map(req => {
              const app = applications.find(a => a.requestId === req.id && a.status === ApplicationStatus.ACCEPTED);
              return (
                <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                        {req.dog?.imageUrl ? <img src={req.dog.imageUrl} className="w-full h-full object-cover" /> : '🐶'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{req.dog?.name}의 산책</h4>
                        <p className="text-sm text-slate-500">{new Date(req.scheduledAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 border border-blue-100">
                        <i className="fas fa-user text-xs"></i>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{app?.walker?.nickname || '산책러'}님</span>
                    </div>
                    <button className="text-blue-600 font-black text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm">채팅하기</button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* 4. 지원자 확인 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-users text-green-400"></i>
            우리 동네 산책러들의 지원
          </h2>
          {openRequests.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <p className="text-slate-400 font-medium">대기 중인 공고가 없습니다.</p>
            </div>
          ) : (
            openRequests.map(req => {
              const reqApps = applications.filter(a => a.requestId === req.id && a.status === ApplicationStatus.PENDING);
              return (
                <div key={req.id} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{req.dog?.name} 공고</span>
                    <span className="text-xs font-bold text-orange-500">{reqApps.length}명 지원</span>
                  </div>
                  {reqApps.length === 0 ? (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center text-sm text-slate-400">
                      아직 지원자가 없습니다.
                    </div>
                  ) : (
                    reqApps.map(app => (
                      <div key={app.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <i className="fas fa-user"></i>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{app.walker?.nickname}</h4>
                            <p className="text-[10px] text-orange-500 font-bold">매너온도 {app.walker?.trustScore}°C</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAcceptApplication(req.id, app.id)}
                          disabled={loadingId === app.id}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-100 disabled:opacity-50"
                        >
                          {loadingId === app.id ? <i className="fas fa-spinner animate-spin"></i> : '수락하기'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
};

export default OwnerDashboard;
