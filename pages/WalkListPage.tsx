
import React from 'react';
import { User, WalkRequest, Application, Dog, Role, WalkStatus } from '../types.ts';
import StatusBadge from '../components/StatusBadge.tsx';

interface Props {
  user: User;
  requests: WalkRequest[];
  applications: Application[];
  dogs: Dog[];
  setRequests: React.Dispatch<React.SetStateAction<WalkRequest[]>>;
}

const WalkListPage: React.FC<Props> = ({ user, requests, applications, dogs }) => {
  const filteredRequests = user.role === Role.OWNER 
    ? requests.filter(r => r.ownerId === user.id && r.status !== WalkStatus.COMPLETED)
    : requests.filter(r => {
        const isMyMatched = applications.some(a => a.requestId === r.id && a.walkerId === user.id && a.status === 'ACCEPTED');
        return isMyMatched && r.status !== WalkStatus.COMPLETED;
      });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800">
        예정된 산책
      </h1>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm">
            <div className="text-5xl">📭</div>
            <p className="text-slate-400 font-bold">현재 진행 중인 목록이 없습니다.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const dog = req.dog;
            return (
              <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {dog?.imageUrl ? (
                      <img src={dog.imageUrl} alt={dog?.name} className="w-full h-full object-cover" />
                    ) : (
                      '🐶'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-800">{dog?.name}</h3>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(req.scheduledAt).toLocaleString('ko-KR', {
                        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                   <span className="text-lg font-black text-orange-500">{req.reward.toLocaleString()}원</span>
                   <button className="text-xs font-bold text-slate-400 hover:text-slate-600">상세보기 <i className="fas fa-chevron-right ml-1"></i></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WalkListPage;
