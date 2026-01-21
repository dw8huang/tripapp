
import React, { useState, useEffect, useRef } from 'react';
import { Trip, Location } from '../types';
import { searchCities } from '../services/geminiService';

interface CreateTripProps {
  onCreate: (data: Partial<Trip>) => void;
  onBack: () => void;
}

const CreateTrip: React.FC<CreateTripProps> = ({ onCreate, onBack }) => {
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedCities, setSelectedCities] = useState<Location[]>([]);
  const [cityResults, setCityResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pass, setPass] = useState('');
  
  const searchTimeout = useRef<number | null>(null);

  const handleCitySearch = (val: string) => {
    setCityInput(val);
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);

    if (val.length < 3) {
      setCityResults([]);
      return;
    }

    searchTimeout.current = window.setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCities(val);
      setCityResults(results);
      setIsSearching(false);
    }, 400); // 400ms debounce
  };

  const addCity = (city: Location) => {
    if (selectedCities.find(c => c.name === city.name)) return;
    setSelectedCities([...selectedCities, city]);
    setCityInput('');
    setCityResults([]);
  };

  const removeCity = (name: string) => {
    setSelectedCities(selectedCities.filter(c => c.name !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !start || !end || selectedCities.length === 0 || !pass) {
      alert('Please fill all fields and add at least one city.');
      return;
    }
    onCreate({
      name,
      startDate: start,
      endDate: end,
      mainCities: selectedCities,
      passwordHash: pass
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Info */}
        <div className="md:w-1/3 bg-blue-600 p-8 text-white flex flex-col justify-between">
          <div>
            <button onClick={onBack} className="mb-8 p-2 hover:bg-white/10 rounded-full transition -ml-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-3xl font-black tracking-tight leading-tight">Start Your Journey</h2>
            <p className="mt-4 text-blue-100 text-sm font-medium">Create a shared space for your friends to plan together.</p>
          </div>
          <div className="hidden md:block">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-blue-600" />)}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-3 opacity-60">Join 10k+ Travelers</p>
          </div>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 space-y-6 max-h-[85vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">What's the Trip Name?</label>
              <input 
                type="text" 
                placeholder="e.g. Kyoto Cherry Blossoms"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Start</label>
                <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">End</label>
                <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cities to Visit</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCities.map(city => (
                  <span key={city.name} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100">
                    {city.name.split(',')[0]}
                    <button type="button" onClick={() => removeCity(city.name)} className="ml-2 text-blue-300 hover:text-red-500 transition">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    </button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Search & Add cities..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-semibold"
                value={cityInput}
                onChange={(e) => handleCitySearch(e.target.value)}
              />
              {isSearching && <div className="absolute right-4 top-[48px] text-[10px] font-black text-blue-500 animate-pulse">Searching...</div>}
              {cityResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {cityResults.map((city, i) => (
                    <button key={i} type="button" onClick={() => addCity(city)} className="w-full text-left px-5 py-4 hover:bg-slate-50 text-sm font-semibold transition">
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Set a Password for Friends</label>
              <input type="password" placeholder="e.g. Adventure2024" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={pass} onChange={(e) => setPass(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 transition active:scale-95 text-lg mt-4">
            Build My Itinerary
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
