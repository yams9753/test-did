
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dog, WalkStatus } from '../types.ts';
import { supabase } from '../supabase.ts';

interface Props {
  user: User;
  dogs: Dog[];
  onSuccess: () => Promise<void>;
}

const RequestCreate: React.FC<Props> = ({ user, dogs, onSuccess }) => {
  const navigate = useNavigate();
  const [dogId, setDogId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('30');
  const [reward, setReward] = useState('15000');
  const [loading, setLoading] = useState(false);

  // 초기 강아지 선택 설정
  useEffect(() => {
    if (dogs.length > 0 && !dogId) {
      setDogId(dogs[0].id);
    }
  }, [dogs, dogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dogId) {
      alert('반려견을 먼저 선택해 주세요. (등록된 반려견이 없다면 먼저 등록해 주세요)');
      return;
    }
    if (!scheduledAt) {
      alert('산책 일시를 선택해 주세요.');
      return;
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      alert('과거 시간은 선택할 수 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('walk_requests')
        .insert({
          owner_id: user.id,
          dog_id: dogId,
          scheduled_at: scheduledDate.toISOString(),
          duration: parseInt(duration),
          reward: parseInt(reward),
          status: WalkStatus.OPEN
        });

      if (error) throw error;

      alert('산책 예약 공고가 등록되었습니다!');
      await onSuccess(); // App 컴포넌트의 전체 공고 목록 갱신
      navigate('/owner');
    } catch (error: any) {
      console.error('Error creating walk request:', error);
      alert('예약 등록에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
          <i className="fas fa-chevron-left"></i>
        </button>
        <h1 className="text-2xl font-black text-gray-900">새 산책 예약</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 space-y-8">
        {/* 반려견 선택 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <i className="fas fa-dog text-orange-400"></i>
            산책할 반려견 선택
          </label>
          {dogs.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-sm text-slate-400 mb-3">등록된 반려견이 없어요.</p>
              <button 
                type="button"
                onClick={() => navigate('/dog/new')}
                className="text-xs font-bold text-orange-500 border border-orange-500 px-3 py-1.5 rounded-lg"
              >
                반려견 등록하러 가기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {dogs.map(dog => (
                <button
                  key={dog.id}
                  type="button"
                  onClick={() => setDogId(dog.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${dogId === dog.id ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md shadow-orange-100' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden shrink-0 ${dogId === dog.id ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {dog.imageUrl ? (
                      <img src={dog.imageUrl} alt={dog.name} className="w-full h-full object-cover" />
                    ) : (
                      dog.name[0]
                    )}
                  </div>
                  <span className="font-bold truncate">{dog.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 일시 선택 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <i className="fas fa-calendar-alt text-orange-400"></i>
            산책 일시
          </label>
          <input 
            type="datetime-local" 
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
            required
          />
        </div>

        {/* 시간 및 보수 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">산책 시간</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold"
            >
              <option value="30">30분</option>
              <option value="60">1시간</option>
              <option value="90">1시간 30분</option>
              <option value="120">2시간</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">제안 보수 (원)</label>
            <input 
              type="number" 
              placeholder="15000"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-black text-orange-600"
              required
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-3xl transition-all shadow-xl shadow-orange-100 text-lg transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner animate-spin"></i> 저장 중...
              </span>
            ) : '산책 공고 올리기'}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
        <i className="fas fa-info-circle text-blue-500 mt-1"></i>
        <p className="text-xs text-blue-700 leading-relaxed font-medium">
          공고를 올리면 동네 산책러들에게 알림이 전달됩니다. 산책 일시와 보수를 정확히 입력해 주세요.
        </p>
      </div>
    </div>
  );
};

export default RequestCreate;
