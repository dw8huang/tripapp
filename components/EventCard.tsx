
import React from 'react';
import { TripEvent } from '../types';
import { ICONS } from '../constants';

interface EventCardProps {
  event: TripEvent;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group active:scale-[0.99]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition">
              {ICONS[event.type as keyof typeof ICONS] || ICONS.Food}
            </span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{event.type}</span>
            {event.startTime && (
              <span className="text-xs font-semibold text-gray-500 px-2 py-0.5 bg-gray-100 rounded-md">
                {event.startTime} {event.endTime ? `— ${event.endTime}` : ''}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight">{event.topic}</h3>
          {event.location && (
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location.name}
            </div>
          )}
          {event.note && (
            <p className="text-sm text-gray-500 line-clamp-2 italic">"{event.note}"</p>
          )}
        </div>
        <div className="ml-4 opacity-0 group-hover:opacity-100 transition">
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 uppercase font-medium">Edited by {event.lastEditedBy}</span>
        {event.location && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location?.name || '')}`, '_blank');
            }}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md"
          >
            Open Maps
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
