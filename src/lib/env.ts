/**
 * Centralized access to Vite environment variables so missing configuration
 * fails loudly and consistently instead of producing cryptic runtime errors.
 */

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;

/**
 * Accept the project URL with or without a trailing `/rest/v1` path; supabase-js
 * expects just the project root (e.g. https://xxxx.supabase.co).
 */
function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  return raw.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export const SUPABASE_URL = normalizeSupabaseUrl(
  import.meta.env.VITE_SUPABASE_URL as string | undefined,
);
export const SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
)?.trim();

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
