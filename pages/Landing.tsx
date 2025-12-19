
import React from 'react';
import { User, Role } from '../types.ts';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
}

const Landing: React.FC<Props> = ({ onLogin, users }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center text-white text-5xl mb-6 shadow-xl">
        <i className="fas fa-paw"></i>
      </div>
      <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">산책할래</h1>
      <p className="text-slate-500 mb-12 max-w-sm text-lg leading-relaxed">
        우리 동네 소중한 반려견을 위한<br />믿을 수 있는 산책 메이트 찾기
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-500 transition-all group">
          <h2 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
            <span className="text-blue-500 group-hover:scale-110 transition-transform"><i className="fas fa-user-friends"></i></span>
            견주로 시작하기
          </h2>
          {users.filter(u => u.role === Role.OWNER).map(user => (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-blue-200"
            >
              {user.nickname} 로그인
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-500 transition-all group">
          <h2 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
            <span className="text-green-500 group-hover:scale-110 transition-transform"><i className="fas fa-running"></i></span>
            산책러로 시작하기
          </h2>
          <div className="flex flex-col gap-2">
            {users.filter(u => u.role === Role.WALKER).map(user => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-green-200"
              >
                {user.nickname} 로그인
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
