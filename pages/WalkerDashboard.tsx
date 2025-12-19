
import React, { useState } from 'react';
import { User, WalkRequest, Application, WalkStatus, ApplicationStatus, Dog, Role } from '../types.ts';
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
  const [view, setView] = useState<'FIND' | 'MY_WALKS'>('FIND');

  // Filter requests that are OPEN and in the walker's region
  const availableRequests = requests.filter(r => r.status === WalkStatus.OPEN && r.ownerId !== user.id);
  
  // My applications
  const myApplications = applications.filter(a => a.walkerId === user.id);
  
  // My matched/completed walks
  const myWalks = requests.filter(req => {
    const myAcceptedApp = myApplications.find(a => a.requestId === req.id && a.status === ApplicationStatus.ACCEPTED);
    return !!myAcceptedApp;
  });

  const handleApply = (requestId: string) => {
    if (myApplications.some(a => a.requestId === requestId)) {
      alert('이미 지원한 산책입니다.');
      return;
    }

    const newApp: Application = {
      id: `app_${Date.now()}`,
      requestId,
      walkerId: user.id,
      status: ApplicationStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    setApplications(prev => [...prev, newApp]);
    alert('지원이 완료되었습니다! 견주의 수락을 기다려주세요.');
  };

  const handleComplete = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: WalkStatus.COMPLETED } : req
    ));
    alert('산책 완료 처리가 되었습니다. 정산 내역을 확인해 주세요!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">산책러 서비스</h1>
          <p className="text-gray-500">우리 동네 강아지들과 행복한 시간을 보내세요.</p>
        </div>
      </div>

      <div className="flex border-b">
        <button 
          onClick={() => setView('FIND')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${view === 'FIND' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          동네 산책 찾기
        </button>
        <button 
          onClick={() => setView('MY_WALKS')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${view === 'MY_WALKS' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          내 산책 현황 ({myWalks.length})
        </button>
      </div>

      {view === 'FIND' ? (
        <div className="grid gap-4">
          {availableRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400">현재 동네에 등록된 산책 예약이 없습니다.</p>
            </div>
          ) : (
            availableRequests.map(req => {
              const dog = dogs.find(d => d.id === req.dogId);
              const alreadyApplied = myApplications.some(a => a.requestId === req.id);

              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-4 flex-grow">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-2xl">
                      <i className="fas fa-dog"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{dog?.name}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{dog?.breed}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <i className="far fa-calendar-alt mr-1"></i>
                        {new Date(req.scheduledAt).toLocaleDateString()} {new Date(req.scheduledAt).getHours()}:00 · {req.duration}분
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{dog?.notes}</p>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2">
                    <div className="text-lg font-black text-green-600">{req.reward.toLocaleString()}원</div>
                    <button 
                      disabled={alreadyApplied}
                      onClick={() => handleApply(req.id)}
                      className={`w-full sm:w-32 py-2 font-bold rounded-xl transition-all shadow-sm ${alreadyApplied ? 'bg-gray-100 text-gray-400' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-100'}`}
                    >
                      {alreadyApplied ? '지원 완료' : '지원하기'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {myWalks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400">진행 중이거나 완료된 산책이 없습니다.</p>
            </div>
          ) : (
            myWalks.map(req => {
              const dog = dogs.find(d => d.id === req.dogId);
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex justify-between mb-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-green-500">
                        <i className="fas fa-paw"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{dog?.name}와의 산책</h3>
                        <p className="text-xs text-gray-500">{new Date(req.scheduledAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-xl mb-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">산책 보수</span>
                    <span className="font-bold text-gray-800">{req.reward.toLocaleString()}원</span>
                  </div>

                  {req.status === WalkStatus.MATCHED && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleComplete(req.id)}
                        className="flex-grow py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-md shadow-green-100"
                      >
                        산책 완료 처리
                      </button>
                    </div>
                  )}
                  {req.status === WalkStatus.COMPLETED && (
                    <div className="text-center py-2 text-green-600 text-sm font-semibold border border-green-200 bg-green-50 rounded-lg">
                      <i className="fas fa-check-circle mr-1"></i> 정산이 완료된 산책입니다.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default WalkerDashboard;
