
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, WalkRequest, Application, WalkStatus, ApplicationStatus, Dog } from '../types';
import StatusBadge from '../components/StatusBadge';

interface Props {
  user: User;
  requests: WalkRequest[];
  applications: Application[];
  setRequests: React.Dispatch<React.SetStateAction<WalkRequest[]>>;
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  dogs: Dog[];
}

const OwnerDashboard: React.FC<Props> = ({ user, requests, applications, setRequests, setApplications, dogs }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const ownerRequests = requests.filter(r => r.ownerId === user.id);
  const activeRequests = ownerRequests.filter(r => r.status !== WalkStatus.COMPLETED);
  const completedRequests = ownerRequests.filter(r => r.status === WalkStatus.COMPLETED);

  const currentList = activeTab === 'ACTIVE' ? activeRequests : completedRequests;

  // Matching Logic (Simulation of the matching API)
  const handleAcceptApplication = (requestId: string, applicationId: string) => {
    // 1. Update the accepted application to ACCEPTED
    // 2. Update all other applications for this request to REJECTED
    // 3. Update the request status to MATCHED
    
    setApplications(prev => prev.map(app => {
      if (app.requestId === requestId) {
        return app.id === applicationId ? { ...app, status: ApplicationStatus.ACCEPTED } : { ...app, status: ApplicationStatus.REJECTED };
      }
      return app;
    }));

    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: WalkStatus.MATCHED } : req
    ));

    alert('매칭이 완료되었습니다! 산책러와 약속된 시간에 산책을 진행해 주세요.');
    setSelectedRequestId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 산책 예약</h1>
          <p className="text-gray-500">우리 아이의 행복한 산책을 관리하세요.</p>
        </div>
        <Link 
          to="/request/new" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-orange-200 flex items-center gap-2 transition-all transform hover:-translate-y-1"
        >
          <i className="fas fa-plus"></i> 새 예약
        </Link>
      </div>

      <div className="flex border-b">
        <button 
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'ACTIVE' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          진행 중 ({activeRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'HISTORY' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          지난 내역 ({completedRequests.length})
        </button>
      </div>

      {currentList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="text-gray-300 text-5xl mb-4"><i className="fas fa-dog"></i></div>
          <p className="text-gray-400">등록된 산책 예약이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {currentList.map(req => {
            const dog = dogs.find(d => d.id === req.dogId);
            const reqApps = applications.filter(a => a.requestId === req.id);
            const isSelected = selectedRequestId === req.id;

            return (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm border p-5 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-orange-500 text-xl font-bold">
                      {dog?.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{dog?.name} ({dog?.breed})</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(req.scheduledAt).toLocaleDateString('ko-KR')} · {req.duration}분 산책
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <div className="flex items-center justify-between text-sm py-3 border-t border-b mb-4">
                  <div className="text-gray-600">
                    <i className="fas fa-won-sign mr-1"></i> <span className="font-semibold">{req.reward.toLocaleString()}원</span>
                  </div>
                  {req.status === WalkStatus.OPEN && (
                    <div className="text-orange-600 font-semibold">
                      <i className="fas fa-users mr-1"></i> 지원자 {reqApps.length}명
                    </div>
                  )}
                </div>

                {req.status === WalkStatus.OPEN && (
                  <button 
                    onClick={() => setSelectedRequestId(isSelected ? null : req.id)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-xl border border-slate-200 transition-colors text-sm"
                  >
                    {isSelected ? '지원자 목록 닫기' : '지원자 확인하기'}
                  </button>
                )}

                {isSelected && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">총 {reqApps.length}명이 지원했습니다.</h4>
                    {reqApps.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">아직 지원자가 없습니다.</p>
                    ) : (
                      reqApps.map(app => (
                        <div key={app.id} className="flex items-center justify-between bg-orange-50 p-3 rounded-xl border border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-400 border border-orange-200">
                              <i className="fas fa-user"></i>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">산책러: {app.walkerId}</p>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded">Trust: 99.0</span>
                                <span className="text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleAcceptApplication(req.id, app.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm"
                          >
                            매칭 확정
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
