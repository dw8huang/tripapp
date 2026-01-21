
import React, { useState, useEffect, useRef } from 'react';
import { Trip, TripEvent } from '../types';
import { DAY_COLORS } from '../constants';

interface MapViewProps {
  trip: Trip;
  activeDay: number;
}

declare const L: any; // Leaflet global

const MapView: React.FC<MapViewProps> = ({ trip, activeDay }) => {
  const [showAllDays, setShowAllDays] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Guard against Leaflet not being loaded
    if (typeof L === 'undefined') {
      setMapError("Map library failed to load. Please check your connection.");
      return;
    }

    const initialLat = trip.mainCities?.[0]?.lat || 0;
    const initialLng = trip.mainCities?.[0]?.lng || 0;

    try {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        fadeAnimation: true
      }).setView([initialLat, initialLng], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 150);
    } catch (err) {
      console.error("Map initialization failed:", err);
      setMapError("Failed to initialize map.");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers and Lines
  useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') return;

    layersRef.current.forEach(layer => mapRef.current.removeLayer(layer));
    layersRef.current = [];

    const events = trip.events || [];
    const mainCities = trip.mainCities || [];
    const dayCityMap = trip.dayCityMap || {};

    const visibleEvents = showAllDays 
      ? events.filter(e => e.location)
      : events.filter(e => e.location && e.dayIndex === activeDay);

    const activeCityName = dayCityMap[activeDay] || mainCities[0]?.name;

    // 1. Draw City Highlights
    mainCities.forEach(city => {
      const isActive = city.name === activeCityName;
      
      const cityCircle = L.circle([city.lat, city.lng], {
        color: isActive ? '#3b82f6' : '#94a3b8',
        fillColor: isActive ? '#3b82f6' : '#94a3b8',
        fillOpacity: isActive ? 0.2 : 0.05,
        radius: 4000,
        weight: isActive ? 2 : 1,
        dashArray: isActive ? '' : '5, 5'
      }).addTo(mapRef.current);
      layersRef.current.push(cityCircle);
      
      const cityDot = L.circleMarker([city.lat, city.lng], {
        radius: isActive ? 6 : 4,
        color: isActive ? '#3b82f6' : '#cbd5e1',
        fillColor: 'white',
        fillOpacity: 1,
        weight: 2
      }).addTo(mapRef.current).bindTooltip(city.name.split(',')[0], { 
        permanent: true, 
        direction: 'top', 
        className: `map-tooltip ${isActive ? 'active-city-tooltip' : ''}` 
      });
      layersRef.current.push(cityDot);
    });

    // 2. Draw Event Markers
    const bounds = L.latLngBounds(mainCities.length > 0 ? mainCities.map(c => [c.lat, c.lng]) : [[0,0]]);

    const dayGroups: Record<number, any[]> = {};

    visibleEvents.forEach(event => {
      if (!event.location) return;
      const { lat, lng } = event.location;
      const color = DAY_COLORS[event.dayIndex % DAY_COLORS.length];
      
      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        color: 'white',
        fillColor: color,
        fillOpacity: 1,
        weight: 3,
        className: 'marker-shadow'
      }).addTo(mapRef.current)
        .bindPopup(`<strong>${event.topic}</strong><br/>${event.startTime || 'No time set'}`)
        .bindTooltip(event.topic, { direction: 'top', offset: [0, -10] });
      
      layersRef.current.push(marker);
      bounds.extend([lat, lng]);

      if (!dayGroups[event.dayIndex]) dayGroups[event.dayIndex] = [];
      dayGroups[event.dayIndex].push({ lat, lng, time: event.startTime || '99:99' });
    });

    // 3. Draw Route Polylines
    Object.entries(dayGroups).forEach(([dayIdx, points]) => {
      const sortedPoints = points.sort((a, b) => a.time.localeCompare(b.time));
      if (sortedPoints.length < 2) return;

      const color = DAY_COLORS[Number(dayIdx) % DAY_COLORS.length];
      const polyline = L.polyline(sortedPoints.map(p => [p.lat, p.lng]), {
        color: color,
        weight: 4,
        opacity: 0.6,
        dashArray: '10, 10'
      }).addTo(mapRef.current);
      layersRef.current.push(polyline);
    });

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [trip.events, activeDay, showAllDays, trip.mainCities, trip.dayCityMap]);

  if (mapError) {
    return (
      <div className="p-4 h-[calc(100vh-210px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 font-medium mb-2">{mapError}</p>
          <button onClick={() => window.location.reload()} className="text-blue-600 font-bold text-sm">Retry Load</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-[calc(100vh-210px)] flex flex-col">
      <style>{`
        .map-tooltip {
          font-size: 10px !important;
          font-weight: 800 !important;
          text-transform: uppercase;
          background: white !important;
          border: none !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          color: #64748b !important;
          padding: 2px 8px !important;
          border-radius: 4px !important;
        }
        .active-city-tooltip {
          color: #3b82f6 !important;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2) !important;
          border: 1px solid #dbeafe !important;
        }
        .marker-shadow {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
      `}</style>
      
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Interactive Map</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{showAllDays ? 'Entire Trip' : `Day ${activeDay + 1} View`}</p>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
          <button onClick={() => setShowAllDays(false)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${!showAllDays ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            Daily
          </button>
          <button onClick={() => setShowAllDays(true)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${showAllDays ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            Full Trip
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-6 right-6 z-[1000] flex flex-col space-y-2">
           <div className="bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl border border-slate-100">
              <p className="text-[9px] font-black uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Legend</p>
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-600">Selected Area</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
