
import { Trip } from '../types';
import { supabase, isCloudConfigured } from './supabase';

const STORAGE_KEY = 'wanderlist_trips_v3';
const COLLABORATOR_LIMIT = 10;

export const dataService = {
  async getAllTrips(): Promise<Trip[]> {
    const saved = localStorage.getItem(STORAGE_KEY);
    const localTrips: Trip[] = saved ? JSON.parse(saved) : [];

    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('tripId');

    if (sharedId && isCloudConfigured) {
      const remote = await this.getSingleTrip(sharedId);
      if (remote) {
        const index = localTrips.findIndex(t => t.id === sharedId);
        if (index > -1) {
          localTrips[index] = remote;
        } else {
          localTrips.push(remote);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localTrips));
      }
    }
    return localTrips;
  },

  async getSingleTrip(tripId: string): Promise<Trip | null> {
    if (!supabase || !isCloudConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('data')
        .eq('id', tripId)
        .single();

      if (error) {
        console.error("Supabase error fetching single trip:", error.message);
        return null;
      }

      const tripData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      return tripData || null;
    } catch (e) {
      console.error("Critical error in getSingleTrip:", e);
      return null;
    }
  },

  async saveTrip(trip: Trip, allTrips: Trip[]): Promise<void> {
    const updatedLocal = allTrips.map(t => t.id === trip.id ? trip : t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

    if (supabase && isCloudConfigured) {
      try {
        const { error } = await supabase
          .from('trips')
          .upsert({
            id: trip.id,
            data: trip,
            name: trip.name,
            start_date: trip.startDate || null,
            end_date: trip.endDate || null,
            collaborators: trip.collaborators,
            event_count: trip.events?.length || 0,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      } catch (e) {
        console.error("Cloud save error:", e);
      }
    }
  },

  async signInWithGoogle() {
    if (!supabase || !isCloudConfigured) {
      alert("Config Error: Supabase strings are missing.");
      return;
    }
    const redirectUri = window.location.origin + (window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      }
    });
    if (error) alert(`Login failed: ${error.message}`);
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.reload();
  },

  canJoinTrip(trip: Trip): boolean {
    const currentCount = trip.collaborators?.length || 0;
    return currentCount < COLLABORATOR_LIMIT;
  },

  getShareLink(tripId: string): string {
    // Return relative query string to prevent pushState origin errors
    return `?tripId=${tripId}`;
  },

  getFullShareLink(tripId: string): string {
    // Use this for copying to clipboard
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('tripId', tripId);
    return url.toString();
  }
};
