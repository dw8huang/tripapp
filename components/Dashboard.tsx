
import React, { useState, useMemo, useEffect } from 'react';
import { Trip, TripEvent, ViewMode, Location } from '../types';
import ItineraryView from './ItineraryView';
import MapView from './MapView';
import SettingsView from './SettingsView';

interface DashboardProps {
  trip: Trip;
  userName: string;
  onUpdate: (trip: Trip) => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ trip, userName, onUpdate, onReset }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('itinerary');
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate cloud syncing indicator
  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [trip]);

  const days = useMemo(() => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return Array.from({ length: diffDays }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        index: i,
        label: `Day ${i + 1}`,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
    });
  }, [trip.startDate, trip.endDate]);

  const handleUpdateEvents = (newEvents: TripEvent[]) => {
    onUpdate({ ...trip, events: newEvents });
  };

  const handleSetDayCity = (cityName: string) => {
    const newMap = { ...trip.dayCityMap, [activeDay]: cityName };
    onUpdate({ ...trip, dayCityMap: newMap });
  };

  const activeCityName = trip.dayCityMap[activeDay] || trip.mainCities[0]?.name || 'Global';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <button 
              onClick={onReset}
              className="p-2 hover:bg-slate-100 rounded-full transition flex-shrink-0"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="font-black text-xl text-slate-800 truncate">{trip.name}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
             {isSyncing ? (
               <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Syncing</span>
               </div>
             ) : (
               <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
               </div>
             )}
          </div>
        </div>
        
        <div className="px-4 pb-2 flex overflow-x-auto scrollbar-hide space-x-2">
          {days.map((day) => (
            <button
              key={day.index}
              onClick={() => setActiveDay(day.index)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-bold transition whitespace-nowrap ${
                activeDay === day.index ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {day.label} <span className="opacity-50 font-medium ml-1">({day.date})</span>
            </button>
          ))}
        </div>

        {trip.mainCities.length > 1 && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center space-x-3 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">Area:</span>
            <div className="flex space-x-1">
              {trip.mainCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleSetDayCity(city.name)}
                  className={`flex-shrink-0 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap border ${
                    activeCityName === city.name
                      ? 'bg-white border-blue-200 text-blue-600 shadow-sm'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-500'
                  }`}
                >
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {viewMode === 'itinerary' && (
          <ItineraryView 
            events={trip.events} 
            activeDay={activeDay} 
            userName={userName}
            onUpdate={handleUpdateEvents}
            mainCity={activeCityName}
          />
        )}
        {viewMode === 'map' && <MapView trip={trip} activeDay={activeDay} />}
        {viewMode === 'settings' && <SettingsView trip={trip} onUpdate={onUpdate} userName={userName} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-20 flex items-center justify-around px-6 z-50">
        <BottomTab label="Itinerary" active={viewMode === 'itinerary'} onClick={() => setViewMode('itinerary')} icon={(<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>)} />
        <BottomTab label="Map" active={viewMode === 'map'} onClick={() => setViewMode('map')} icon={(<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 10V7" /></svg>)} />
        <BottomTab label="Settings" active={viewMode === 'settings'} onClick={() => setViewMode('settings')} icon={(<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>)} />
      </nav>
    </div>
  );
};

interface BottomTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const BottomTab: React.FC<BottomTabProps> = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition ${active ? 'text-blue-600' : 'text-slate-400'}`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
  </button>
);

export default Dashboard;
