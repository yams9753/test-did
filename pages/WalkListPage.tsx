
import React from 'react';
import { User, WalkRequest, Application, Dog, Role, WalkStatus, ApplicationStatus } from '../types.ts';
import StatusBadge from '../components/StatusBadge.tsx';

interface Props {
  user: User;
  requests: WalkRequest[];
  applications: Application[];
  dogs: Dog[];
  setRequests: React.Dispatch<React.SetStateAction<WalkRequest[]>>;
}

const WalkListPage: React.FC<Props> = ({ user, requests, applications }) => {
  const filteredRequests = user.role === Role.OWNER 
    ? requests.filter(r => r.ownerId === user.id && r.status !== WalkStatus.COMPLETED)
    : requests.filter(r => {
        const myApp = applications.find(a => a.requestId === r.id && a.walkerId === user.id);
        return myApp && (myApp.status === ApplicationStatus.PENDING || myApp.status === ApplicationStatus.ACCEPTED) && r.status !== WalkStatus.COMPLETED;
      });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-800">
          {user.role === Role.OWNER ? '관리 중인 산책' : '나의 산책 리스트'}
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          {user.role === Role.OWNER ? '등록하신 산책 공고와 매칭된 일정을 확인하세요.' : '지원하신 내역과 확정된 산책 일정을 확인하세요.'}
        </p>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl">
              {user.role === Role.OWNER ? '📝' : '🔍'}
            </div>
            <p className="text-slate-800 font-black text-lg">표시할 산책이 없습니다.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const dog = req.dog;
            const myApp = user.role === Role.WALKER 
              ? applications.find(a => a.requestId === req.id && a.walkerId === user.id)
              : null;

            return (
              <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl overflow-hidden shrink-0">
                      {dog?.imageUrl ? <img src={dog.imageUrl} alt={dog?.name} className="w-full h-full object-cover" /> : '🐶'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-800 text-lg">{dog?.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-bold">{req.region}</span>
                        <StatusBadge status={myApp ? myApp.status : req.status} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-slate-600">
                          {new Date(req.scheduledAt).toLocaleString('ko-KR', {
                            month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">{req.duration}분 산책</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 tracking-tighter uppercase">예상 보수</p>
                      <p className="text-xl font-black text-orange-500">{req.reward.toLocaleString()}원</p>
                    </div>
                  </div>
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
