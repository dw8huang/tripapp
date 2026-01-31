
import React, { useState, useRef } from 'react';
import { Trip, Location } from '../types';
import { searchCities } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { downloadTripCSV } from '../services/csvExport';

interface SettingsViewProps {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
  userName: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ trip, onUpdate, userName }) => {
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  
  const [cityInput, setCityInput] = useState('');
  const [cityResults, setCityResults] = useState<Location[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [isEditingCities, setIsEditingCities] = useState(false);
  
  const searchTimeout = useRef<number | null>(null);

  const handleUpdatePassword = () => {
    if (!newPassword.trim()) return;
    if (confirm('Change trip password?')) {
      onUpdate({ ...trip, passwordHash: newPassword });
      setNewPassword('');
      setIsUpdatingPass(false);
    }
  };

  const handleCitySearch = (val: string) => {
    setCityInput(val);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    if (val.length < 3) {
      setCityResults([]);
      return;
    }
    searchTimeout.current = window.setTimeout(async () => {
      setIsSearchingCity(true);
      const results = await searchCities(val);
      setCityResults(results);
      setIsSearchingCity(false);
    }, 400);
  };

  const addCity = (city: Location) => {
    if (trip.mainCities.find(c => c.name === city.name)) return;
    onUpdate({ ...trip, mainCities: [...trip.mainCities, city] });
    setCityInput('');
    setCityResults([]);
  };

  const removeCity = (name: string) => {
    onUpdate({ ...trip, mainCities: trip.mainCities.filter(c => c.name !== name) });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(dataService.getShareLink(trip.id));
    alert('Invite link copied! Share this with your friends.');
  };

  const remaining = 10 - (trip.collaborators?.length || 0);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 pb-32">
      <section className="bg-blue-600 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
        <h3 className="text-2xl font-black mb-2 tracking-tight">Invite Friends</h3>
        <p className="text-blue-100 text-sm mb-6 font-medium">
          Everyone with the link and password can plan together. 
          <br/><span className="font-black text-white">Password: {trip.passwordHash}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={copyUrl} className="flex-1 bg-white text-blue-600 font-bold py-4 rounded-2xl hover:bg-blue-50 transition active:scale-95 shadow-lg">
            Copy Link
          </button>
        </div>
      </section>

      <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Team Capacity</h3>
          <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            {remaining} Slots left
          </span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {trip.collaborators.map((name, i) => (
            <div key={i} className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center space-x-3 group transition hover:border-blue-200">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shadow-sm">
                {name[0].toUpperCase()}
              </div>
              <div>
                <span className="text-sm font-black text-slate-800">{name}</span>
                {name === userName && <span className="text-[9px] block font-black text-blue-500 uppercase tracking-tighter">You</span>}
              </div>
            </div>
          ))}
          {Array.from({ length: remaining }).map((_, i) => (
            <div key={`empty-${i}`} className="px-5 py-3 rounded-2xl border-2 border-dashed border-slate-100 flex items-center space-x-3 opacity-40">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                 <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                 </svg>
              </div>
              <span className="text-xs font-bold text-slate-400 italic">Empty Slot</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Global Controls</h3>
        
        <div className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-black text-slate-800">Map Focus Areas</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Quick jump locations</p>
            </div>
            <button onClick={() => setIsEditingCities(!isEditingCities)} className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-blue-600 hover:bg-blue-50 transition">
              {isEditingCities ? 'Done' : 'Edit'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {trip.mainCities.map(city => (
              <span key={city.name} className="px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 flex items-center">
                {city.name.split(',')[0]}
                {isEditingCities && (
                  <button onClick={() => removeCity(city.name)} className="ml-2 text-red-400 hover:text-red-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </button>
                )}
              </span>
            ))}
          </div>

          {isEditingCities && (
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search to add area..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100/30 font-bold text-sm"
                value={cityInput}
                onChange={(e) => handleCitySearch(e.target.value)}
              />
              {cityResults.length > 0 && (
                <div className="absolute z-30 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-40 overflow-y-auto divide-y divide-slate-50">
                  {cityResults.map((city, i) => (
                    <button key={i} onClick={() => addCity(city)} className="w-full text-left px-5 py-4 hover:bg-slate-50 text-sm font-bold transition">
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-800">Trip Password</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Currently: {trip.passwordHash}</p>
            </div>
            <button onClick={() => setIsUpdatingPass(!isUpdatingPass)} className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-blue-600 hover:bg-blue-50 transition">
              {isUpdatingPass ? 'Cancel' : 'Change'}
            </button>
          </div>
          {isUpdatingPass && (
            <div className="space-y-3 pt-5">
              <input type="password" placeholder="New adventure password" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button onClick={handleUpdatePassword} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition">Update Password</button>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Export</h3>
        <div className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-800">Export Itinerary</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Download trip plan as CSV</p>
            </div>
            <button
              onClick={() => downloadTripCSV(trip)}
              className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition active:scale-95 shadow-lg"
            >
              Download CSV
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
