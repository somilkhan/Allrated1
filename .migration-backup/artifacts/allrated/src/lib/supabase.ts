import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from './env';

/**
 * Supabase is optional at build time. When the env vars are absent the client
 * is null and the UI degrades gracefully (auth/lists are disabled) instead of
 * crashing.
 */
export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).',
    );
  }
  return supabase;
}
