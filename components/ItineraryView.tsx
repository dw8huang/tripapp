
import React, { useState, useMemo } from 'react';
import { TripEvent, EventType } from '../types';
import { PRESET_TYPES, ICONS } from '../constants';
import EventCard from './EventCard';
import EditEventPanel from './EditEventPanel';

interface ItineraryViewProps {
  events: TripEvent[];
  activeDay: number;
  userName: string;
  onUpdate: (events: TripEvent[]) => void;
  mainCity: string;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ events, activeDay, userName, onUpdate, mainCity }) => {
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const dayEvents = useMemo(() => {
    return events
      .filter(e => e.dayIndex === activeDay)
      .sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [events, activeDay]);

  const handleAddEvent = () => {
    const newEvent: TripEvent = {
      id: Math.random().toString(36).substr(2, 9),
      topic: 'New Event',
      type: EventType.FOOD,
      note: '',
      dayIndex: activeDay,
      lastEditedBy: userName,
    };
    onUpdate([...events, newEvent]);
    setEditingEventId(newEvent.id);
  };

  const handleUpdateEvent = (updated: TripEvent) => {
    onUpdate(events.map(e => e.id === updated.id ? updated : e));
    setEditingEventId(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Delete this event?')) {
      onUpdate(events.filter(e => e.id !== id));
      setEditingEventId(null);
    }
  };

  const editingEvent = events.find(e => e.id === editingEventId);

  return (
    <div className="p-4 relative">
      <div className="max-w-2xl mx-auto space-y-4">
        {dayEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No events planned for this day.</p>
            <button 
              onClick={handleAddEvent}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              + Add first event
            </button>
          </div>
        ) : (
          dayEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => setEditingEventId(event.id)} 
            />
          ))
        )}

        {dayEvents.length > 0 && (
          <button 
            onClick={handleAddEvent}
            className="w-full py-4 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-medium hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center space-x-2"
          >
            <span>+ Add Event</span>
          </button>
        )}
      </div>

      {editingEvent && (
        <EditEventPanel 
          event={editingEvent}
          mainCity={mainCity}
          onSave={handleUpdateEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setEditingEventId(null)}
          userName={userName}
        />
      )}
    </div>
  );
};

export default ItineraryView;
