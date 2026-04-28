import { createClient } from '@supabase/supabase-js';

// Remove any accidental quotes the user might have added in Vercel
const cleanUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/^["']|["']$/g, '');
const cleanKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').replace(/^["']|["']$/g, '');

let client = null;

try {
  if (cleanUrl && cleanKey) {
    client = createClient(cleanUrl, cleanKey);
  }
} catch (err) {
  console.error("Failed to initialize Supabase client. Please check your environment variables.", err);
}

export const supabase = client;
