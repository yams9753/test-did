
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dog, WalkStatus, WalkRequest } from '../types';

interface Props {
  user: User;
  dogs: Dog[];
  onSubmit: (request: WalkRequest) => void;
}

const RequestCreate: React.FC<Props> = ({ user, dogs, onSubmit }) => {
  const navigate = useNavigate();
  const [dogId, setDogId] = useState(dogs[0]?.id || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('30');
  const [reward, setReward] = useState('15000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dogId || !scheduledAt || !duration || !reward) {
      alert('모든 항목을 입력해 주세요.');
      return;
    }

    const newRequest: WalkRequest = {
      id: `req_${Date.now()}`,
      ownerId: user.id,
      dogId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      duration: parseInt(duration),
      reward: parseInt(reward),
      status: WalkStatus.OPEN,
      createdAt: new Date().toISOString(),
    };

    onSubmit(newRequest);
    alert('산책 예약이 등록되었습니다! 동네 산책러들에게 알림을 보냈어요.');
    navigate('/owner');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-xl">
          <i className="fas fa-chevron-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">새 산책 예약</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">반려견 선택</label>
          <div className="grid grid-cols-2 gap-2">
            {dogs.map(dog => (
              <button
                key={dog.id}
                type="button"
                onClick={() => setDogId(dog.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${dogId === dog.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${dogId === dog.id ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {dog.name[0]}
                </div>
                <span className="font-semibold">{dog.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">산책 일시</label>
          <input 
            type="datetime-local" 
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">산책 시간 (분)</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="30">30분</option>
              <option value="60">60분</option>
              <option value="90">90분</option>
              <option value="120">120분</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">제안 보수 (원)</label>
            <input 
              type="number" 
              placeholder="15,000"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold"
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-100 text-lg"
          >
            예약 올리기
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        <i className="fas fa-info-circle mr-1"></i> 산책러가 지원하면 앱 푸시로 알려드려요.
      </p>
    </div>
  );
};

export default RequestCreate;
