
import React, { useState } from 'react';
import { User, Role } from '../types.ts';
import { supabase } from '../supabase.ts';

interface Props {
  user: User;
  onLogout: () => void;
  onUpdate: (userId: string) => Promise<void>;
}

const Profile: React.FC<Props> = ({ user, onLogout, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [regionCode, setRegionCode] = useState(user.regionCode);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nickname: nickname,
          region_code: regionCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await onUpdate(user.id);
      setIsEditing(false);
      alert('프로필이 성공적으로 수정되었습니다.');
    } catch (error: any) {
      alert(error.message || '수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-slate-800">마이페이지</h1>
        <button 
          onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
          disabled={loading}
          className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${isEditing ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {loading ? '저장 중...' : (isEditing ? '저장하기' : '정보 수정')}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] flex items-center justify-center text-white text-5xl shadow-xl shadow-orange-100 mb-6 relative">
          <i className="fas fa-user"></i>
          <button className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 border border-slate-50">
             <i className="fas fa-camera text-sm"></i>
          </button>
        </div>
        
        {isEditing ? (
          <input 
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="text-center text-xl font-bold text-slate-800 border-b-2 border-orange-200 focus:border-orange-500 outline-none pb-1"
          />
        ) : (
          <h2 className="text-2xl font-black text-slate-800">{user.nickname}</h2>
        )}

        <div className="flex items-center gap-2 mt-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${user.role === Role.OWNER ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
            {user.role === Role.OWNER ? 'Pet Owner' : 'Dog Walker'}
          </span>
          <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5">
            <i className="fas fa-temperature-high text-[10px]"></i>
            매너온도 {user.trustScore.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-50 font-black text-xs text-slate-400 uppercase tracking-widest">계정 정보</div>
        <div className="divide-y divide-slate-50">
          <div className="p-5 flex justify-between items-center">
            <span className="text-slate-500 font-bold">활동 지역</span>
            {isEditing ? (
              <select 
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-sm font-bold outline-none"
              >
                <option value="SEOUL_GANGNAM">서울특별시 강남구</option>
                <option value="SEOUL_MAPO">서울특별시 마포구</option>
                <option value="SEOUL_SONGPA">서울특별시 송파구</option>
              </select>
            ) : (
              <span className="font-bold text-slate-800">{regionCode === 'SEOUL_GANGNAM' ? '서울특별시 강남구' : regionCode}</span>
            )}
          </div>
          <div className="p-5 flex justify-between items-center">
            <span className="text-slate-500 font-bold">회원 식별 코드</span>
            <span className="font-mono text-[10px] text-slate-300 bg-slate-50 px-2 py-1 rounded-md">{user.id.slice(0, 18)}...</span>
          </div>
        </div>
      </div>

      {/* Service Settings */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-50 font-black text-xs text-slate-400 uppercase tracking-widest">설정</div>
        <div className="divide-y divide-slate-50 text-slate-700">
          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <i className="fas fa-bell"></i>
              </div>
              <span className="font-bold">푸시 알림 설정</span>
            </div>
            <i className="fas fa-chevron-right text-xs text-slate-200 group-hover:text-slate-400"></i>
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full p-5 flex items-center justify-between hover:bg-red-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              <span className="font-bold text-slate-700 group-hover:text-red-600">로그아웃</span>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-slate-300 text-[10px] font-bold tracking-widest uppercase">산책할래 v1.1.0 · Supabase Connected</p>
      </div>
    </div>
  );
};

export default Profile;
