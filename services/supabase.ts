import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * CONFIGURATION GUIDE:
 * 1. SUPABASE_URL: Found in Settings -> API -> Project URL
 * 2. SUPABASE_ANON_KEY: Found in Settings -> API -> `anon` public key (starts with eyJ...)
 */
const SUPABASE_URL =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  'https://yuwcasjgtsucuquupnja.supabase.co';

const SUPABASE_ANON_KEY =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d2Nhc2pndHN1Y3VxdXVwbmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjEzMjcsImV4cCI6MjA4NDU5NzMyN30.38jL2QlAXwlXT_O3yKQEIluzuuN6MbHmW1mD-lWuYNc'; // PASTE YOUR `anon` KEY HERE (It should start with eyJ...)

// Validation check
export const isKeyValid = SUPABASE_ANON_KEY.startsWith('eyJ');
export const isCloudConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY && isKeyValid);

export const supabase: SupabaseClient | null = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!isCloudConfigured) {
  console.warn("Supabase configuration is incomplete or invalid. Login and cloud sync are disabled.");
}
