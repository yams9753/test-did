
import React, { useState } from 'react';
import { supabase } from '../supabase.ts';
import { Role } from '../types.ts';

// 포트원 전역 객체 타입 정의
declare global {
  interface Window {
    IMP: any;
  }
}

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

  // 본인인증 관련 상태
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [impUid, setImpUid] = useState(''); // 서버 검증용 UID

  const handleRealVerification = () => {
    const { IMP } = window;
    if (!IMP) {
      alert('인증 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 포트원 초기화 (내 식별코드 입력 필요)
    // 실제 서비스시에는 본인의 식별코드를 넣어야 합니다.
    IMP.init("imp00000000"); 

    setVerifying(true);

    // 본인인증 실행
    IMP.certification({
      pg: 'inicis_unified', // 또는 'danal' 등 설정한 PG사
      merchant_uid: `mid_${new Date().getTime()}`, // 주문번호 (임의 생성)
      m_redirect_url: window.location.href, // 모바일 환경에서 리다이렉트 될 URL
      popup: true // PC 환경에서 팝업 사용 여부
    }, async (rsp: any) => {
      if (rsp.success) {
        // 인증 성공 시
        setImpUid(rsp.imp_uid);
        
        // 1. (실제 운영 시) 이 단계에서 imp_uid를 서버(Supabase Edge Function 등)로 보내 
        // 포트원 API를 통해 실제 이름, 전화번호, 생년월일을 가져와야 합니다.
        // 여기서는 성공한 것으로 간주하고 시뮬레이션합니다.
        
        console.log('인증 성공 imp_uid:', rsp.imp_uid);
        setIsPhoneVerified(true);
        setVerifying(false);
        alert('본인인증이 성공적으로 완료되었습니다.');
      } else {
        // 인증 실패 시
        setVerifying(false);
        alert(`인증에 실패했습니다: ${rsp.error_msg}`);
      }
    });
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
            data: { 
              nickname: nickname.trim(), 
              role, 
              phone_verified: true,
              imp_uid: impUid // 추후 관리를 위해 저장
            }
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
                <label className="block text-xs font-bold text-slate-400 ml-1 uppercase">본인 확인</label>
                <button 
                  type="button" 
                  onClick={handleRealVerification}
                  disabled={isPhoneVerified || verifying}
                  className={`w-full p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                    isPhoneVerified 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  {verifying ? (
                    <i className="fas fa-spinner animate-spin"></i>
                  ) : isPhoneVerified ? (
                    <><i className="fas fa-check-circle"></i> 본인인증 완료</>
                  ) : (
                    <><i className="fas fa-mobile-alt"></i> 휴대폰 본인인증 하기</>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-1">
                  통신사(SKT, KT, LG U+)를 통한 안전한 본인인증을 진행합니다.
                </p>
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
