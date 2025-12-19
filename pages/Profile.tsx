
import React from 'react';
import { User, Role } from '../types.ts';

interface Props {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<Props> = ({ user, onLogout }) => {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg mb-4">
          <i className="fas fa-user"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{user.nickname}님</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === Role.OWNER ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            {user.role === Role.OWNER ? '견주 회원' : '산책러 회원'}
          </span>
          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <i className="fas fa-medal text-[10px]"></i>
            매너온도 {user.trustScore.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-50 font-bold text-sm text-slate-400">계정 정보</div>
        <div className="divide-y divide-slate-50">
          <div className="p-4 flex justify-between items-center">
            <span className="text-slate-600">활동 지역</span>
            <span className="font-medium text-slate-800">{user.regionCode === 'SEOUL_GANGNAM' ? '서울특별시 강남구' : user.regionCode}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-slate-600">아이디(식별자)</span>
            <span className="font-mono text-xs text-slate-400">{user.id}</span>
          </div>
        </div>
      </div>

      {/* Service Settings */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-50 font-bold text-sm text-slate-400">서비스 설정</div>
        <div className="divide-y divide-slate-50 text-slate-700">
          <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <i className="fas fa-bell text-slate-400"></i>
              <span>알림 설정</span>
            </div>
            <i className="fas fa-chevron-right text-xs text-slate-300"></i>
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <i className="fas fa-shield-alt text-slate-400"></i>
              <span>동네 인증하기</span>
            </div>
            <i className="fas fa-chevron-right text-xs text-slate-300"></i>
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 text-red-500">
              <i className="fas fa-sign-out-alt"></i>
              <span onClick={onLogout}>로그아웃</span>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center pb-10">
        <p className="text-slate-300 text-[10px]">산책할래 v1.0.0 · 하이퍼로컬 산책 매칭 서비스</p>
      </div>
    </div>
  );
};

export default Profile;
