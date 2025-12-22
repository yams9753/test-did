
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Role, User, Dog, WalkRequest, Application, Size, WalkStatus, ApplicationStatus } from './types.ts';
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

  const fetchDogs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', userId);

      if (error) throw error;
      
      const mappedDogs: Dog[] = data.map(d => ({
        id: d.id,
        ownerId: d.owner_id,
        name: d.name,
        breed: d.breed,
        size: d.size as Size,
        notes: d.notes,
        imageUrl: d.image_url
      }));
      
      setDogs(mappedDogs);
    } catch (e) {
      console.error('Fetch dogs failed:', e);
    }
  };

  const fetchApplications = async () => {
    try {
      // profiles와 join하여 산책러 닉네임 등을 함께 가져옴
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:walker_id (id, nickname, trust_score, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedApps: Application[] = data.map(a => ({
        id: a.id,
        requestId: a.request_id,
        walkerId: a.walker_id,
        status: a.status as ApplicationStatus,
        createdAt: a.created_at,
        walker: a.profiles ? {
          id: a.profiles.id,
          nickname: a.profiles.nickname,
          trustScore: a.profiles.trust_score,
          role: a.profiles.role as Role,
          regionCode: '' // 필요한 경우 profiles 테이블 구성에 따라 추가
        } : undefined
      }));

      setApplications(mappedApps);
    } catch (e) {
      console.error('Fetch applications failed:', e);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('walk_requests')
        .select(`
          *,
          dogs (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedRequests: WalkRequest[] = data.map(r => ({
        id: r.id,
        ownerId: r.owner_id,
        dogId: r.dog_id,
        scheduledAt: r.scheduled_at,
        duration: r.duration,
        reward: r.reward,
        status: r.status as WalkStatus,
        createdAt: r.created_at,
        dog: r.dogs ? {
          id: r.dogs.id,
          ownerId: r.dogs.owner_id,
          name: r.dogs.name,
          breed: r.dogs.breed,
          size: r.dogs.size as Size,
          notes: r.dogs.notes,
          imageUrl: r.dogs.image_url
        } : undefined
      }));

      setRequests(mappedRequests);
    } catch (e) {
      console.error('Fetch requests failed:', e);
    }
  };

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
        await fetchDogs(userId);
        await fetchRequests();
        await fetchApplications();
      } else if (error && (error.code === 'PGRST116' || error.message.includes('No rows found'))) {
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
            await fetchDogs(userId);
            await fetchRequests();
            await fetchApplications();
          }
        }
      }
    } catch (e) {
      console.error('Fetch profile failed:', e);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        await fetchRequests();
        await fetchApplications();
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setDogs([]);
        setRequests([]);
        setApplications([]);
        await fetchRequests();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const handleRefresh = async () => {
    await fetchRequests();
    await fetchApplications();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">로딩 중...</p>
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
                  onRefresh={handleRefresh}
                /> : <Navigate to="/" />
              } 
            />

            <Route path="/request/new" element={currentUser?.role === Role.OWNER ? <RequestCreate user={currentUser} dogs={dogs} onSuccess={fetchRequests} /> : <Navigate to="/" />} />
            <Route 
              path="/dog/new" 
              element={
                currentUser?.role === Role.OWNER 
                ? <DogCreate user={currentUser} onSuccess={() => fetchDogs(currentUser.id)} /> 
                : <Navigate to="/" />
              } 
            />
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
