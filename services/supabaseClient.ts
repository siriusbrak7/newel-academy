
import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// Note: In a real Vite environment, these would be import.meta.env.VITE_SUPABASE_URL
// For this environment, we check process.env or fallback to empty strings to prevent crashes if not set.
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => !!supabase;
