
import React from 'react';
import { User, WalkRequest, Application, Dog, Role, WalkStatus } from '../types.ts';

interface Props {
  user: User;
  requests: WalkRequest[];
  applications: Application[];
  dogs: Dog[];
}

const HistoryPage: React.FC<Props> = ({ user, requests, applications, dogs }) => {
  const completedRequests = requests.filter(r => {
    if (r.status !== WalkStatus.COMPLETED) return false;
    if (user.role === Role.OWNER) return r.ownerId === user.id;
    return applications.some(a => a.requestId === r.id && a.walkerId === user.id && a.status === 'ACCEPTED');
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800">완료된 산책 내역</h1>
        <span className="text-xs text-slate-400 font-bold">최근 3개월</span>
      </div>

      <div className="grid gap-4">
        {completedRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm">
            <div className="text-5xl">🍃</div>
            <p className="text-slate-400 font-bold">아직 완료된 산책이 없습니다.</p>
          </div>
        ) : (
          completedRequests.map(req => {
            const dog = req.dog;
            return (
              <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-slate-300 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl overflow-hidden shrink-0">
                      {dog?.imageUrl ? (
                        <img src={dog.imageUrl} alt={dog?.name} className="w-full h-full object-cover" />
                      ) : (
                        '🦴'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700">{dog?.name}와의 산책</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(req.scheduledAt).toLocaleDateString()} · {req.duration}분 수행
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">정산 완료</p>
                    <p className="text-xs text-slate-400">+{req.reward.toLocaleString()}원</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end gap-2">
                  <button className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">리뷰 작성</button>
                  <button className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">동일한 조건으로 재예약</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
