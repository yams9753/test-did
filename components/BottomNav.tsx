
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Role } from '../types.ts';

interface Props {
  user: User;
}

const BottomNav: React.FC<Props> = ({ user }) => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    {
      label: '홈',
      icon: 'fa-home',
      to: user.role === Role.OWNER ? '/owner' : '/walker',
      active: path === '/owner' || path === '/walker'
    },
    {
      label: user.role === Role.OWNER ? '예약하기' : '산책찾기',
      icon: user.role === Role.OWNER ? 'fa-plus-circle' : 'fa-search',
      to: user.role === Role.OWNER ? '/request/new' : '/walker', // 산책러는 대시보드 내 리스트 탭
      active: path === '/request/new'
    },
    {
      label: '내역',
      icon: 'fa-clipboard-list',
      to: '/history',
      active: path === '/history'
    },
    {
      label: '마이',
      icon: 'fa-user',
      to: '/profile',
      active: path === '/profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="container mx-auto max-w-4xl h-16 flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              item.active ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fas ${item.icon} text-xl mb-1`}></i>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
