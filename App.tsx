
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
import ChatRoom from './pages/ChatRoom.tsx';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      
      const mappedDogs: Dog[] = (data || []).map(d => ({
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
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          walker:profiles!walker_id (id, nickname, trust_score, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedApps: Application[] = (data || []).map(a => ({
        id: a.id,
        requestId: a.request_id,
        walkerId: a.walker_id,
        status: a.status as ApplicationStatus,
        createdAt: a.created_at,
        walker: a.walker ? {
          id: a.walker.id,
          nickname: a.walker.nickname,
          trustScore: a.walker.trust_score,
          role: a.walker.role as Role,
          regionCode: ''
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

      const mappedRequests: WalkRequest[] = (data || []).map(r => ({
        id: r.id,
        ownerId: r.owner_id,
        dogId: r.dog_id,
        scheduledAt: r.scheduled_at,
        duration: r.duration,
        reward: r.reward,
        status: r.status as WalkStatus,
        region: r.region || '미지정',
        poopCount: r.poop_count || 0,
        peeCount: r.pee_count || 0,
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
        .maybeSingle();

      if (data && !error) {
        setCurrentUser({
          id: data.id,
          nickname: data.nickname,
          role: data.role as Role,
          regionCode: data.region_code || '미지정',
          trustScore: Number(data.trust_score) || 36.5
        });
        await Promise.allSettled([
          fetchDogs(userId),
          fetchRequests(),
          fetchApplications()
        ]);
      }
    } catch (e) {
      console.error('Fetch profile failed:', e);
    }
  };

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 4000);

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          await fetchProfile(session.user.id);
        } else if (mounted) {
          await Promise.allSettled([fetchRequests(), fetchApplications()]);
        }
      } catch (err) {
        console.error('Initial check failed:', err);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session) {
        await fetchProfile(session.user.id);
        setLoading(false);
      } else {
        setCurrentUser(null);
        setDogs([]);
        setRequests([]);
        setApplications([]);
        setLoading(false);
        fetchRequests();
        fetchApplications();
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.allSettled([fetchRequests(), fetchApplications()]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">잠시만 기다려 주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
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
                  onRefresh={handleRefresh}
                /> : <Navigate to="/" replace />
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
                /> : <Navigate to="/" replace />
              } 
            />

            <Route path="/chat/:requestId" element={currentUser ? <ChatRoom user={currentUser} /> : <Navigate to="/" replace />} />

            <Route 
              path="/request/new" 
              element={
                currentUser?.role === Role.OWNER ? 
                <RequestCreate 
                  user={currentUser} 
                  dogs={dogs} 
                  onSuccess={handleRefresh} 
                /> : <Navigate to="/" replace />
              } 
            />

            <Route 
              path="/dog/new" 
              element={
                currentUser?.role === Role.OWNER ? 
                <DogCreate 
                  user={currentUser} 
                  onSuccess={() => fetchDogs(currentUser.id)} 
                /> : <Navigate to="/" replace />
              } 
            />

            <Route 
              path="/history" 
              element={
                currentUser ? 
                <HistoryPage 
                  user={currentUser} 
                  requests={requests} 
                  applications={applications} 
                  dogs={dogs} 
                /> : <Navigate to="/" replace />
              } 
            />

            <Route 
              path="/list" 
              element={
                currentUser ? 
                <WalkListPage 
                  user={currentUser} 
                  requests={requests} 
                  applications={applications} 
                  dogs={dogs}
                  setRequests={setRequests}
                /> : <Navigate to="/" replace />
              } 
            />

            <Route 
              path="/profile" 
              element={
                currentUser ? 
                <Profile 
                  user={currentUser} 
                  onLogout={handleLogout} 
                  onUpdate={fetchProfile} 
                /> : <Navigate to="/" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
