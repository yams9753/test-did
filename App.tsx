
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Role, User, Dog, WalkRequest, Application } from './types.ts';
import { supabase } from './supabase.ts';
import Navigation from './components/Navigation.tsx';
import OwnerDashboard from './pages/OwnerDashboard.tsx';
import WalkerDashboard from './pages/WalkerDashboard.tsx';
import RequestCreate from './pages/RequestCreate.tsx';
import Landing from './pages/Landing.tsx';
import Profile from './pages/Profile.tsx';
import WalkListPage from './pages/WalkListPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';
import DogCreate from './pages/DogCreate.tsx';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WalkRequest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setCurrentUser({
          id: data.id,
          nickname: data.nickname,
          role: data.role as Role,
          regionCode: data.region_code || '미지정',
          trustScore: Number(data.trust_score) || 36.5
        });
      } else if (error && (error.code === 'PGRST116' || error.message.includes('No rows found'))) {
        // Auth 세션은 있는데 Profile 데이터가 없는 경우 (가입 프로세스 중단 등)
        console.warn('Profile not found for authenticated user, attempting recovery...');
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          const defaultNickname = userData.user.user_metadata?.nickname || '회원';
          const defaultRole = userData.user.user_metadata?.role || Role.OWNER;
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              nickname: defaultNickname,
              role: defaultRole,
              region_code: '미지정',
              trust_score: 36.5
            })
            .select()
            .single();

          if (newProfile && !insertError) {
            setCurrentUser({
              id: newProfile.id,
              nickname: newProfile.nickname,
              role: newProfile.role as Role,
              regionCode: newProfile.region_code || '미지정',
              trustScore: 36.5
            });
          }
        }
      } else if (error) {
        console.error('Error fetching profile:', error.message);
      }
    } catch (e) {
      console.error('Fetch profile failed:', e);
    }
  };

  useEffect(() => {
    const savedRequests = localStorage.getItem('requests');
    const savedApps = localStorage.getItem('applications');
    const savedDogs = localStorage.getItem('dogs');
    
    if (savedRequests) setRequests(JSON.parse(savedRequests));
    if (savedApps) setApplications(JSON.parse(savedApps));
    if (savedDogs) setDogs(JSON.parse(savedDogs));
  }, []);

  useEffect(() => {
    localStorage.setItem('requests', JSON.stringify(requests));
    localStorage.setItem('applications', JSON.stringify(applications));
    localStorage.setItem('dogs', JSON.stringify(dogs));
  }, [requests, applications, dogs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const handleDogCreate = (newDog: Dog) => {
    setDogs(prev => [...prev, newDog]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation user={currentUser} onLogout={handleLogout} />
        
        <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
          <Routes>
            <Route 
              path="/" 
              element={
                currentUser ? (
                  <Navigate to={currentUser.role === Role.OWNER ? "/owner" : "/walker"} replace />
                ) : (
                  <Landing onLogin={fetchProfile} />
                )
              } 
            />
            
            <Route 
              path="/owner" 
              element={
                currentUser?.role === Role.OWNER ? 
                <OwnerDashboard 
                  user={currentUser} 
                  requests={requests} 
                  applications={applications}
                  setRequests={setRequests}
                  setApplications={setApplications}
                  dogs={dogs}
                  allUsers={[]} 
                /> : <Navigate to="/" />
              } 
            />
            
            <Route 
              path="/walker" 
              element={
                currentUser?.role === Role.WALKER ? 
                <WalkerDashboard 
                  user={currentUser} 
                  requests={requests} 
                  applications={applications}
                  setApplications={setApplications}
                  setRequests={setRequests}
                  dogs={dogs}
                /> : <Navigate to="/" />
              } 
            />

            <Route path="/request/new" element={currentUser?.role === Role.OWNER ? <RequestCreate user={currentUser} dogs={dogs} onSubmit={(newReq) => setRequests(prev => [newReq, ...prev])} /> : <Navigate to="/" />} />
            <Route path="/dog/new" element={currentUser?.role === Role.OWNER ? <DogCreate user={currentUser} onSubmit={handleDogCreate} /> : <Navigate to="/" />} />
            <Route path="/profile" element={currentUser ? <Profile user={currentUser} onLogout={handleLogout} onUpdate={fetchProfile} /> : <Navigate to="/" />} />
            <Route path="/list" element={currentUser ? <WalkListPage user={currentUser} requests={requests} applications={applications} dogs={dogs} setRequests={setRequests} /> : <Navigate to="/" />} />
            <Route path="/history" element={currentUser ? <HistoryPage user={currentUser} requests={requests} applications={applications} dogs={dogs} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
