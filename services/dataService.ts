
import { Trip } from '../types';

/**
 * NOTE FOR DEPLOYMENT:
 * To make this live, you will eventually install supabase:
 * npm install @supabase/supabase-js
 * 
 * Then uncomment the Supabase code below.
 */

/*
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)
*/

const STORAGE_KEY = 'wanderlist_trips_v3';
const COLLABORATOR_LIMIT = 10;

export const dataService = {
  /**
   * Fetches all trips. In "Cloud Mode", this would fetch from Supabase.
   */
  async getAllTrips(): Promise<Trip[]> {
    return new Promise((resolve) => {
      // Simulation of a database fetch
      setTimeout(() => {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const raw = JSON.parse(saved);
            const migrated = raw.map((t: any) => ({
              ...t,
              maxCollaborators: 10, // Strict limit of 10
              collaborators: t.collaborators || [],
              events: t.events || [],
              mainCities: t.mainCities || [],
            }));
            resolve(migrated);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.error("Storage load failed", e);
          resolve([]);
        }
      }, 500);
    });
  },

  /**
   * Saves a trip. In "Cloud Mode", this would 'upsert' to Supabase.
   */
  async saveTrip(trip: Trip, allTrips: Trip[]): Promise<void> {
    // Local fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTrips));
    
    // Cloud Logic (Pseudo-code for when you add Supabase)
    /*
    const { data, error } = await supabase
      .from('trips')
      .upsert({ 
        id: trip.id, 
        name: trip.name, 
        data: trip, 
        password_hash: trip.passwordHash 
      })
    */

    return new Promise(r => setTimeout(r, 300));
  },

  /**
   * Checks if a new person can join the trip
   */
  canJoinTrip(trip: Trip): boolean {
    const currentCount = trip.collaborators?.length || 0;
    return currentCount < COLLABORATOR_LIMIT;
  },

  /**
   * Generates the public share link
   */
  getShareLink(tripId: string): string {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('tripId', tripId);
    return url.toString();
  }
};
