/**
 * Centralized access to Vite environment variables so missing configuration
 * fails loudly and consistently instead of producing cryptic runtime errors.
 */

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const hasTmdb = Boolean(TMDB_API_KEY);
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function requireTmdbKey(): string {
  if (!TMDB_API_KEY) {
    throw new Error(
      'Missing VITE_TMDB_API_KEY. Add it to your .env file (see .env.example).',
    );
  }
  return TMDB_API_KEY;
}
