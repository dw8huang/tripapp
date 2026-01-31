<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WanderList - Collaborative Trip Planner

A real-time collaborative trip planning app built with React, TypeScript, and Gemini AI.

## Website

**Live site:** [https://wanderlist-collaborative-itinerary-535868137095.us-west1.run.app](https://wanderlist-collaborative-itinerary-535868137095.us-west1.run.app)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   ```
   npm run dev
   ```

## Cloud Database

This app uses [Supabase](https://supabase.com/) for cloud storage and real-time collaboration. The integration is fully configured in [services/dataService.ts](services/dataService.ts) and [services/supabase.ts](services/supabase.ts).

**Configuration:**
- Supabase URL and anon key are set in [.env.local](.env.local)
- Fallback to localStorage when Supabase is unavailable
- Automatic trip syncing when sharing via URL

## Features

- Multi-day itinerary planning
- Interactive map view (Leaflet)
- AI-powered location search (Gemini)
- Trip sharing with password protection (up to 10 collaborators)
- CSV export of complete itinerary
- Mobile-friendly responsive design
