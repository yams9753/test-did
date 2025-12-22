
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Role } from '../types.ts';

interface Props {
  user: User | null;
  onLogout: () => void;
}

const Navigation: React.FC<Props> = ({ user, onLogout }) => {
  const location = useLocation();
  const path = location.pathname;

  if (!user) return null;

  const menuItems = [
    { label: '홈', to: user.role === Role.OWNER ? '/owner' : '/walker', icon: 'fa-home' },
    { label: '신청 내역', to: '/history', icon: 'fa-clipboard-list' },
    { label: '산책 목록', to: '/list', icon: 'fa-dog' },
    { label: '마이페이지', to: '/profile', icon: 'fa-user' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl h-20 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:rotate-12 transition-transform duration-300">
              <i className="fas fa-paw text-xl"></i>
            </div>
            <span className="font-black text-2xl text-slate-800 tracking-tight">산책할래</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => {
              const isActive = path === item.to || (item.to === '/owner' && path === '/owner') || (item.to === '/walker' && path === '/walker');
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isActive 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <i className={`fas ${item.icon} ${isActive ? 'text-orange-500' : 'text-slate-300'}`}></i>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user.role === Role.OWNER && (
            <Link 
              to="/request/new"
              className="hidden sm:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-orange-100 transition-all hover:-translate-y-0.5"
            >
              <i className="fas fa-plus"></i>
              산책 예약하기
            </Link>
          )}

          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block mx-2"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end hidden lg:flex">
              <span className="text-sm font-black text-slate-800 leading-none">{user.nickname}</span>
              <span className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wider">
                {user.role === Role.OWNER ? 'Pet Owner' : 'Dog Walker'}
              </span>
            </div>
            
            <Link 
              to="/profile" 
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:border-orange-300 hover:bg-orange-50 transition-all"
              title="마이페이지"
            >
              <i className="fas fa-user-circle text-xl"></i>
            </Link>

            <button 
              onClick={onLogout}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
              title="로그아웃"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Visible on Small Screens) */}
      <div className="md:hidden border-t border-slate-50 flex justify-around py-3 bg-white/50">
        {menuItems.map((item) => {
          const isActive = path === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-orange-500' : 'text-slate-400'}`}
            >
              <i className={`fas ${item.icon} text-lg`}></i>
              <span className="text-[9px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
