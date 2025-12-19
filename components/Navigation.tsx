
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Role } from '../types';

interface Props {
  user: User | null;
  onLogout: () => void;
}

const Navigation: React.FC<Props> = ({ user, onLogout }) => {
  const location = useLocation();

  if (!user) return null;

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
        <Link to={user.role === Role.OWNER ? "/owner" : "/walker"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-paw"></i>
          </div>
          <span className="font-bold text-xl text-orange-600 hidden sm:inline">산책할래</span>
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
            <span className={`w-2 h-2 rounded-full ${user.role === Role.OWNER ? 'bg-blue-500' : 'bg-green-500'}`}></span>
            <span className="text-gray-700">{user.nickname}님</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
