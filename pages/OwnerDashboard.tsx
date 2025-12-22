
import React from 'react';
import { Link } from 'react-router-dom';
import { User, WalkRequest, Application, WalkStatus, Dog } from '../types.ts';
import StatusBadge from '../components/StatusBadge.tsx';

interface Props {
  user: User;
  requests: WalkRequest[];
  applications: Application[];
  setRequests: React.Dispatch<React.SetStateAction<WalkRequest[]>>;
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  dogs: Dog[];
  allUsers: User[];
}

const OwnerDashboard: React.FC<Props> = ({ user, requests, applications, dogs, allUsers }) => {
  const ownerRequests = requests.filter(r => r.ownerId === user.id);
  const matchedRequests = ownerRequests.filter(r => r.status === WalkStatus.MATCHED);
  const openRequests = ownerRequests.filter(r => r.status === WalkStatus.OPEN);

  return (
    <div className="space-y-8">
      {/* 1. Header & Quick Action */}
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

      {/* 2. My Dogs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-dog text-orange-400"></i>
            내 반려견 정보
          </h2>
          <Link to="/dog/new" className="text-sm font-bold text-orange-500 hover:underline">추가 등록</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {dogs.filter(d => d.ownerId === user.id).length === 0 ? (
            <div className="w-full bg-white p-10 rounded-3xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 mb-4">등록된 반려견이 없습니다.</p>
              <Link to="/dog/new" className="text-orange-500 font-bold border border-orange-500 px-4 py-2 rounded-xl">첫 반려견 등록하기</Link>
            </div>
          ) : (
            dogs.filter(d => d.ownerId === user.id).map(dog => (
              <div key={dog.id} className="min-w-[280px] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-orange-200 transition-colors">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🐶
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{dog.name}</h3>
                  <p className="text-sm text-slate-400">{dog.breed} · {dog.size}형견</p>
                  <div className="mt-2 text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-bold inline-block">
                    {dog.notes || '착한 아이에요'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. 실시간 현황 (Matched) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-clock text-blue-400"></i>
            실시간 산책 현황
          </h2>
          {matchedRequests.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <p className="text-slate-400 font-medium">현재 진행 중인 산책이 없습니다.</p>
            </div>
          ) : (
            matchedRequests.map(req => {
              const dog = dogs.find(d => d.id === req.dogId);
              const app = applications.find(a => a.requestId === req.id && a.status === 'ACCEPTED');
              const walker = allUsers.find(u => u.id === app?.walkerId);
              return (
                <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3">
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <i className="fas fa-walking text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{dog?.name}의 산책이 예정됨</h4>
                      <p className="text-sm text-slate-500">{new Date(req.scheduledAt).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'})} 시작</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                        <i className="fas fa-user text-xs"></i>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{walker?.nickname} 산책러</span>
                    </div>
                    <button className="text-blue-500 font-bold text-sm">채팅하기</button>
                  </div>
                </div>
              )
            })
          )}
        </section>

        {/* 4. 최근 공고 (Open) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-bullhorn text-green-400"></i>
              산책러를 기다리는 공고
            </h2>
            <Link to="/list" className="text-sm text-slate-400 hover:text-slate-600">전체보기 <i className="fas fa-chevron-right text-[10px]"></i></Link>
          </div>
          {openRequests.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <p className="text-slate-400 font-medium">대기 중인 공고가 없습니다.</p>
            </div>
          ) : (
            openRequests.slice(0, 2).map(req => {
              const dog = dogs.find(d => d.id === req.dogId);
              const reqApps = applications.filter(a => a.requestId === req.id);
              return (
                <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 font-black">
                      {dog?.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{dog?.name} · {req.duration}분</h4>
                      <p className="text-xs text-slate-400">{new Date(req.scheduledAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-500 font-black">{req.reward.toLocaleString()}원</p>
                    <span className="text-[10px] font-bold text-slate-400">{reqApps.length}명 지원중</span>
                  </div>
                </div>
              )
            })
          )}
        </section>
      </div>
    </div>
  );
};

export default OwnerDashboard;
