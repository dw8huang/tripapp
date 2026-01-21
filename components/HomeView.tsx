
import React, { useState } from 'react';
import { Trip } from '../types';

interface HomeViewProps {
  trips: Trip[];
  onSelectTrip: (id: string) => void;
  onCreateClick: () => void;
  onDeleteTrip: (id: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ trips = [], onSelectTrip, onCreateClick, onDeleteTrip }) => {
  const [showPast, setShowPast] = useState(false);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const sortedTrips = [...trips].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const activeTrips = sortedTrips.filter(t => t.endDate && new Date(t.endDate) >= now);
  const pastTrips = sortedTrips.filter(t => t.endDate && new Date(t.endDate) < now);

  const displayedTrips = showPast ? pastTrips : activeTrips;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">WanderList</h1>
              <div className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">
                PROTOTYPE
              </div>
            </div>
            <p className="text-slate-500 font-medium flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Collaboration Limited to 10 People
            </p>
          </div>
          <button 
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-200 transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Trip</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setShowPast(false)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${!showPast ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Active ({activeTrips.length})
            </button>
            <button 
              onClick={() => setShowPast(true)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${showPast ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Past ({pastTrips.length})
            </button>
          </div>
        </div>

        {displayedTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTrips.map(trip => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onClick={() => onSelectTrip(trip.id)}
                onDelete={() => {
                  if(confirm('Delete this trip forever?')) onDeleteTrip(trip.id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Ready to fly?</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">
              Start planning your next adventure. Invite up to 10 friends to join.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
  onDelete: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onClick, onDelete }) => {
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : null;
  const isOngoing = start && end && new Date() >= start && new Date() <= end;
  
  const count = trip.collaborators?.length || 0;
  const limit = trip.maxCollaborators || 10;
  const percentage = (count / limit) * 100;

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[32px] p-7 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col h-full"
    >
      {isOngoing && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-5 py-1.5 uppercase tracking-widest rounded-bl-2xl">
          Ongoing
        </div>
      )}
      
      <div className="mb-5">
        <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition truncate tracking-tight">{trip.name || 'Untitled Trip'}</h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
          {start?.toLocaleDateString()} — {end?.toLocaleDateString()}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collaborators</span>
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{count}/{limit}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
           <div 
              className={`h-full transition-all duration-500 ${count >= limit ? 'bg-amber-500' : 'bg-blue-500'}`} 
              style={{ width: `${percentage}%` }} 
           />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-auto">
        {(trip.mainCities || []).slice(0, 3).map(city => (
          <span key={city.name} className="text-[10px] font-black uppercase tracking-tighter bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-100">
            {city.name?.split(',')[0]}
          </span>
        ))}
      </div>

      <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
        <div className="flex -space-x-2.5">
          {(trip.collaborators || []).slice(0, 4).map((c, i) => (
            <div key={i} className="w-9 h-9 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[11px] font-black text-blue-600 shadow-sm">
              {c?.[0] || '?'}
            </div>
          ))}
          {trip.collaborators?.length > 4 && (
            <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[11px] font-black text-slate-400 shadow-sm">
              +{trip.collaborators.length - 4}
            </div>
          )}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomeView;
