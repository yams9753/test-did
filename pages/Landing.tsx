
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

  // 휴대폰 인증 관련 상태
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('올바른 휴대폰 번호를 입력해 주세요.');
      return;
    }
    setVerifying(true);
    // 시뮬레이션: 1초 후 인증번호 발송 완료 처리
    setTimeout(() => {
      setIsCodeSent(true);
      setVerifying(false);
      console.log('인증번호 "123456"이 발송되었습니다.'); // 테스트용
    }, 1000);
  };

  const handleVerifyCode = () => {
    if (verificationCode === '123456') { // 테스트용 고정 코드
      setIsPhoneVerified(true);
      alert('본인인증이 완료되었습니다.');
    } else {
      alert('인증번호가 일치하지 않습니다. (테스트 번호: 123456)');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (isSignUp) {
      if (!nickname || nickname.trim().length < 2) {
        alert('닉네임을 2자 이상 입력해 주세요.');
        return;
      }
      if (!isPhoneVerified) {
        alert('휴대폰 본인인증을 완료해 주세요.');
        return;
      }
    }
    
    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    setLoading(true);

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { nickname: nickname.trim(), role, phone: phoneNumber }
          }
        });
        
        if (authError) throw authError;

        if (authData.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            nickname: nickname.trim(),
            role: role,
            region_code: '미지정',
            trust_score: 36.5
          });

          if (authData.session) {
            await onLogin(authData.user.id);
          } else {
            alert('인증 메일을 발송했습니다. 메일함 확인 후 로그인해 주세요.');
            setIsSignUp(false);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        if (data.user) await onLogin(data.user.id);
      }
    } catch (error: any) {
      alert(error.message || '인증 과정에서 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10">
      <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white text-4xl mb-6 shadow-xl shadow-orange-100">
        <i className="fas fa-paw"></i>
      </div>
      <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">산책할래</h1>
      <p className="text-slate-500 mb-8 text-center max-w-sm font-medium leading-relaxed">
        {isSignUp ? '간편하게 가입하고 산책을 시작하세요!' : '반가워요! 다시 만나서 기뻐요.'}
      </p>

      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isSignUp ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
          >
            로그인
          </button>
          <button 
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isSignUp ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">역할 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRole(Role.OWNER)} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${role === Role.OWNER ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>🐶 견주님</button>
                  <button type="button" onClick={() => setRole(Role.WALKER)} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${role === Role.WALKER ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>🚶 산책러</button>
                </div>
              </div>
              
              <input type="text" placeholder="닉네임 (2자 이상)" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" />

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 ml-1 uppercase">휴대폰 본인인증</label>
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    placeholder="휴대폰 번호 (-없이)" 
                    value={phoneNumber} 
                    disabled={isPhoneVerified}
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    className="flex-grow p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" 
                  />
                  <button 
                    type="button" 
                    onClick={handleSendCode}
                    disabled={isPhoneVerified || verifying}
                    className="px-4 bg-slate-800 text-white rounded-2xl text-xs font-bold whitespace-nowrap disabled:opacity-50"
                  >
                    {isCodeSent ? '재발송' : '인증요청'}
                  </button>
                </div>
                {isCodeSent && !isPhoneVerified && (
                  <div className="flex gap-2 animate-fadeIn">
                    <input 
                      type="text" 
                      placeholder="인증번호 6자리" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value)} 
                      className="flex-grow p-4 bg-orange-50 border border-orange-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-orange-600" 
                    />
                    <button type="button" onClick={handleVerifyCode} className="px-6 bg-orange-500 text-white rounded-2xl text-xs font-bold">확인</button>
                  </div>
                )}
                {isPhoneVerified && (
                  <p className="text-xs text-green-600 font-bold ml-1 flex items-center gap-1">
                    <i className="fas fa-check-circle"></i> 인증이 완료되었습니다.
                  </p>
                )}
              </div>
            </>
          )}

          <input type="email" placeholder="이메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" required />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all shadow-lg text-lg disabled:opacity-50">
            {loading ? <i className="fas fa-spinner animate-spin"></i> : (isSignUp ? '가입 완료하기' : '로그인')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Landing;
