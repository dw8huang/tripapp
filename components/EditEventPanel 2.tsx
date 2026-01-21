
import React, { useState, useEffect } from 'react';
import { TripEvent, EventType, Location } from '../types';
import { PRESET_TYPES } from '../constants';
import { searchPlaces } from '../services/geminiService';

interface EditEventPanelProps {
  event: TripEvent;
  mainCity: string;
  onSave: (event: TripEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  userName: string;
}

const EditEventPanel: React.FC<EditEventPanelProps> = ({ event, mainCity, onSave, onDelete, onClose, userName }) => {
  const [formData, setFormData] = useState<TripEvent>({ ...event });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchPlaces(searchQuery, mainCity);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lastEditedBy: userName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Edit Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.startTime || ''}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, type})}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      formData.type === type 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Note</label>
              <textarea 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="Add some details..."
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              />
            </div>

            {/* Location Search */}
            <div className="border-t border-gray-100 pt-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
              {formData.location ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center text-blue-800">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-sm font-semibold">{formData.location.name}</span>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, location: undefined})}
                    className="text-blue-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder={`Search in ${mainCity}...`}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="px-4 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                    >
                      {isSearching ? '...' : 'Search'}
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                      {searchResults.map((loc, i) => (
                        <button
                          key={i}
                          onClick={() => setFormData({...formData, location: loc})}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm transition"
                        >
                          {loc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex space-x-3">
          <button 
            onClick={() => onDelete(formData.id)}
            className="px-6 py-4 border border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition"
          >
            Delete
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventPanel;
