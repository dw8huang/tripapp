<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WanderList - Collaborative Trip Planner

A real-time collaborative trip planning app built with React, TypeScript, and Gemini AI.

## Website

> **Live site:** _Coming soon -- URL will be added here._

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

> **Database details will be added here once configured.**
>
> This app is designed to work with [Supabase](https://supabase.com/). See `services/dataService.ts` for the integration scaffold (currently using localStorage as a fallback).
>
> To enable cloud storage:
> 1. Create a Supabase project
> 2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your environment
> 3. Uncomment the Supabase client code in `services/dataService.ts`

## Features

- Multi-day itinerary planning
- Interactive map view (Leaflet)
- AI-powered location search (Gemini)
- Trip sharing with password protection (up to 10 collaborators)
- CSV export of complete itinerary
- Mobile-friendly responsive design
