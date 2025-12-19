
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Role, User, Dog, WalkRequest, Application } from './types.ts';
import Navigation from './components/Navigation.tsx';
import OwnerDashboard from './pages/OwnerDashboard.tsx';
import WalkerDashboard from './pages/WalkerDashboard.tsx';
import RequestCreate from './pages/RequestCreate.tsx';
import Landing from './pages/Landing.tsx';
import Profile from './pages/Profile.tsx';
import WalkListPage from './pages/WalkListPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: 'u1', nickname: '행복한견주', regionCode: 'SEOUL_GANGNAM', trustScore: 48.5, role: Role.OWNER },
  { id: 'u2', nickname: '프로산책러', regionCode: 'SEOUL_GANGNAM', trustScore: 99.0, role: Role.WALKER },
  { id: 'u3', nickname: '댕댕이친구', regionCode: 'SEOUL_GANGNAM', trustScore: 72.0, role: Role.WALKER },
];

const MOCK_DOGS: Dog[] = [
  { id: 'd1', ownerId: 'u1', name: '초코', breed: '푸들', size: 'S' as any, notes: '사람을 아주 좋아해요!' },
  { id: 'd2', ownerId: 'u1', name: '쿠키', breed: '비숑', size: 'M' as any, notes: '조금 겁이 많아요.' },
];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<WalkRequest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [dogs, setDogs] = useState<Dog[]>(MOCK_DOGS);

  // Persistence (Simulation)
  useEffect(() => {
    const savedRequests = localStorage.getItem('requests');
    const savedApps = localStorage.getItem('applications');
    if (savedRequests) setRequests(JSON.parse(savedRequests));
    if (savedApps) setApplications(JSON.parse(savedApps));
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('requests', JSON.stringify(requests));
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [requests, applications]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

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
                  <Landing onLogin={handleLogin} users={MOCK_USERS} />
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
                  allUsers={MOCK_USERS}
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

            <Route 
              path="/request/new" 
              element={
                currentUser?.role === Role.OWNER ? 
                <RequestCreate 
                  user={currentUser} 
                  dogs={dogs}
                  onSubmit={(newReq) => setRequests(prev => [newReq, ...prev])}
                /> : <Navigate to="/" />
              } 
            />

            <Route 
              path="/profile" 
              element={currentUser ? <Profile user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} 
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
                /> : <Navigate to="/" />
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
                /> : <Navigate to="/" />
              } 
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
