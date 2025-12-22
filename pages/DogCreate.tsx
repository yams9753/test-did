
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dog, Size } from '../types.ts';
import { supabase } from '../supabase.ts';

interface Props {
  user: User;
  onSuccess: () => Promise<void>;
}

const DogCreate: React.FC<Props> = ({ user, onSuccess }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState<Size>(Size.S);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 사진 관련 상태
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dog_image')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('dog_image')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !breed) {
      alert('이름과 견종을 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      let publicUrl = '';
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) publicUrl = uploadedUrl;
      }

      const { error } = await supabase
        .from('dogs')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          breed: breed.trim(),
          size: size,
          notes: notes.trim(),
          image_url: publicUrl // 이미지 URL 저장
        });

      if (error) throw error;

      alert(`${name} 등록이 완료되었습니다!`);
      await onSuccess(); // 상위 컴포넌트의 반려견 목록 갱신
      navigate('/owner');
    } catch (error: any) {
      console.error('Error inserting dog:', error);
      alert('반려견 등록에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const sizes = [
    { value: Size.S, label: '소형견', desc: '10kg 미만' },
    { value: Size.M, label: '중형견', desc: '10~25kg' },
    { value: Size.L, label: '대형견', desc: '25kg 이상' },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-xl">
          <i className="fas fa-chevron-left"></i>
        </button>
        <h1 className="text-2xl font-black text-gray-900">반려견 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center group cursor-pointer hover:border-orange-200 transition-colors overflow-hidden relative min-h-[160px]"
        >
          {imagePreview ? (
            <div className="w-full h-full absolute inset-0">
              <img src={imagePreview} alt="Dog Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <i className="fas fa-camera text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-3xl mb-3 group-hover:bg-orange-50 group-hover:text-orange-400 transition-all">
                <i className="fas fa-camera"></i>
              </div>
              <p className="text-sm font-bold text-slate-400 group-hover:text-orange-500">사진 추가하기</p>
            </>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">이름</label>
            <input 
              type="text" 
              placeholder="예: 초코, 뭉치"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">견종</label>
            <input 
              type="text" 
              placeholder="예: 푸들, 말티즈"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
              disabled={loading}
            />
          </div>
        </div>

        {/* Size Selection */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-3">아이 크기</label>
          <div className="grid grid-cols-3 gap-3">
            {sizes.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSize(s.value)}
                disabled={loading}
                className={`p-3 rounded-2xl border-2 transition-all text-center ${
                  size === s.value 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-slate-50 bg-slate-50 text-slate-400'
                }`}
              >
                <p className={`text-sm font-bold ${size === s.value ? 'text-orange-600' : ''}`}>{s.label}</p>
                <p className="text-[10px] mt-1 opacity-60">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">특징 및 참고사항</label>
          <textarea 
            placeholder="사람을 좋아하는지, 주의해야 할 간식이 있는지 알려주세요."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium h-32 resize-none"
            disabled={loading}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-3xl transition-all shadow-xl shadow-orange-100 text-lg transform active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-spinner animate-spin"></i> 등록 중...
            </span>
          ) : '등록 완료'}
        </button>
      </form>
    </div>
  );
};

export default DogCreate;
