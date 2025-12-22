
import React, { useState } from 'react';
import { supabase } from '../supabase.ts';
import { Role } from '../types.ts';

interface Props {
  onLogin: (userId: string) => Promise<void>;
}

const Landing: React.FC<Props> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<Role>(Role.OWNER);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    // 데이터 정제
    const cleanEmail = email.trim().toLowerCase();
    
    if (isSignUp && (!nickname || nickname.trim().length < 2)) {
      alert('닉네임을 2자 이상 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Auth 계정 생성
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              nickname: nickname.trim(),
              role: role
            }
          }
        });
        
        if (authError) {
          if (authError.message.includes('User already registered')) {
            alert('이미 가입된 이메일입니다. 로그인 탭에서 로그인을 진행해 주세요.');
            setIsSignUp(false);
            setLoading(false);
            return;
          }
          throw authError;
        }

        if (authData.user) {
          // 2. profiles 테이블에 회원 정보 수동 저장
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              nickname: nickname.trim(),
              role: role,
              region_code: '미지정',
              trust_score: 36.5
            });

          if (profileError) {
            console.error('Profile DB Sync Error:', profileError);
          }

          if (authData.session) {
            // 이메일 인증이 꺼져있어 바로 세션이 생기는 경우
            await onLogin(authData.user.id);
          } else {
            // 이메일 인증이 필요한 경우
            alert('회원가입 신청이 완료되었습니다! \n\n중요: 입력하신 이메일의 메일함에서 인증 링크를 클릭해야 로그인이 가능합니다. 인증 후 로그인 탭에서 다시 로그인해 주세요.');
            // 가입 정보 유지하되 비밀번호만 비우고 로그인 탭으로 전환
            setPassword('');
            setIsSignUp(false);
          }
        }
      } else {
        // 로그인 시도
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        
        if (error) {
          console.error('Detailed Login Error:', error);
          
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다. \n\n1. 오타가 없는지 확인해 주세요. \n2. 가입한 적이 없다면 [회원가입] 탭을 이용해 주세요. \n3. 이메일 인증을 완료했는지 확인해 주세요.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('이메일 인증이 완료되지 않았습니다. 메일함의 인증 링크를 클릭한 후 다시 시도해 주세요.');
          }
          throw error;
        }

        if (data.user) {
          await onLogin(data.user.id);
        }
      }
    } catch (error: any) {
      alert(error.message || '인증 과정에서 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white text-4xl mb-6 shadow-xl shadow-orange-100">
        <i className="fas fa-paw"></i>
      </div>
      <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">산책할래</h1>
      <p className="text-slate-500 mb-8 text-center max-w-sm font-medium leading-relaxed">
        우리 동네 소중한 반려견을 위한<br />믿을 수 있는 산책 메이트 서비스
      </p>

      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setPassword('');
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isSignUp ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
          >
            로그인
          </button>
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setPassword('');
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isSignUp ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">사용자 역할</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole(Role.OWNER)}
                    className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${role === Role.OWNER ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    🐶 견주님
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(Role.WALKER)}
                    className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${role === Role.WALKER ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    🚶 산책러
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="닉네임 (2자 이상)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
                required={isSignUp}
              />
            </>
          )}
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-100 text-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner animate-spin"></i> 처리 중...
              </span>
            ) : (isSignUp ? '가입하기' : '로그인')}
          </button>
        </form>
        
        {!isSignUp && (
          <p className="text-center text-xs text-slate-400 mt-5">
            비밀번호를 잊으셨나요? <span className="underline cursor-pointer hover:text-slate-600">재설정 링크 받기</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Landing;
