
export enum EventType {
  FOOD = 'Food',
  PARK = 'Park',
  MUSEUM = 'Museum',
  TRANSPORT = 'Transport',
  HOTEL = 'Hotel',
  SHOPPING = 'Shopping',
  CUSTOM = 'Custom'
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface TripEvent {
  id: string;
  topic: string;
  type: EventType | string;
  note: string;
  startTime?: string;
  endTime?: string;
  location?: Location;
  lastEditedBy: string;
  dayIndex: number;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  mainCities: Location[];
  dayCityMap: Record<number, string>;
  passwordHash: string;
  events: TripEvent[];
  collaborators: string[];
  maxCollaborators: number; // New: Limit for collaboration
}

export type ViewMode = 'itinerary' | 'map' | 'people';
