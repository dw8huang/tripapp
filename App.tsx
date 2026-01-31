
import React, { useState, useEffect } from 'react';
import { Trip } from './types';
import { dataService } from './services/dataService';
import HomeView from './components/HomeView';
import CreateTrip from './components/CreateTrip';
import LockedView from './components/LockedView';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [unlockedTripIds, setUnlockedTripIds] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [view, setView] = useState<'home' | 'create' | 'dashboard'>('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const data = await dataService.getAllTrips();
      setTrips(data);
      setIsLoading(false);

      const params = new URLSearchParams(window.location.search);
      const sharedId = params.get('tripId');
      if (sharedId) {
        setActiveTripId(sharedId);
        setView('dashboard');
      }
    };
    init();
  }, []);

  const handleCreate = async (data: Partial<Trip>) => {
    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Our Adventure',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      mainCities: data.mainCities || [],
      dayCityMap: {},
      passwordHash: data.passwordHash || '',
      ownerPasswordHash: data.ownerPasswordHash || data.passwordHash || '',
      ownerName: data.ownerName || userName || 'Owner',
      events: [],
      collaborators: [],
      maxCollaborators: 10,
    };
    
    const updated = [...trips, newTrip];
    setTrips(updated);
    await dataService.saveTrip(newTrip, updated);
    
    setActiveTripId(newTrip.id);
    setUnlockedTripIds([...unlockedTripIds, newTrip.id]);
    setView('dashboard');
    window.history.pushState({}, '', dataService.getShareLink(newTrip.id));
  };

  const handleUpdateTrip = async (updatedTrip: Trip) => {
    const updated = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
    setTrips(updated);
    await dataService.saveTrip(updatedTrip, updated);
  };

  const handleUnlock = (password: string, name: string) => {
    const currentTrip = trips.find(t => t.id === activeTripId);
    if (!currentTrip) return;

    if (password !== currentTrip.passwordHash) {
      alert('Incorrect password');
      return;
    }

    const isExistingMember = currentTrip.collaborators.includes(name);
    if (!isExistingMember && !dataService.canJoinTrip(currentTrip)) {
      alert('Trip Full: This adventure has reached the 10-person limit.');
      return;
    }

    setUserName(name);
    setUnlockedTripIds([...unlockedTripIds, currentTrip.id]);
    
    if (!isExistingMember) {
      handleUpdateTrip({
        ...currentTrip,
        collaborators: [...currentTrip.collaborators, name]
      });
    }
  };

  const handleSelectTrip = (id: string) => {
    setActiveTripId(id);
    setView('dashboard');
    window.history.pushState({}, '', dataService.getShareLink(id));
  };

  const handleGoHome = () => {
    setView('home');
    setActiveTripId(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 relative mb-6">
           <div className="absolute inset-0 border-4 border-blue-100 rounded-2xl" />
           <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-2xl animate-spin" />
        </div>
        <h2 className="text-slate-800 font-black text-xl tracking-tighter">WanderList</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Checking Cloud Storage...</p>
      </div>
    );
  }

  const currentTrip = trips.find(t => t.id === activeTripId);

  if (view === 'create') {
    return <CreateTrip onCreate={handleCreate} onBack={() => setView('home')} />;
  }

  if (view === 'dashboard' && currentTrip) {
    if (!unlockedTripIds.includes(currentTrip.id)) {
      return <LockedView trip={currentTrip} onUnlock={handleUnlock} onBack={handleGoHome} />;
    }
    return (
      <Dashboard 
        trip={currentTrip} 
        userName={userName}
        onUpdate={handleUpdateTrip} 
        onReset={handleGoHome}
      />
    );
  }

  return (
    <HomeView 
      trips={trips} 
      onSelectTrip={handleSelectTrip} 
      onCreateClick={() => setView('create')}
      onDeleteTrip={async (id) => {
        if(confirm('Delete this trip? It will be removed from your local device.')) {
          const updated = trips.filter(t => t.id !== id);
          setTrips(updated);
          localStorage.setItem('wanderlist_trips_v3', JSON.stringify(updated));
        }
      }}
    />
  );
};

export default App;
