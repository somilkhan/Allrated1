import type { Item, Metric } from '../data/catalog';
import { requireTmdbKey } from '../lib/env';
import { encodeId } from './ids';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export type TmdbMediaType = 'movie' | 'tv';

const EMOJI: Record<TmdbMediaType, string> = { movie: '🎬', tv: '📺' };

// TMDB genre ids are stable; hardcoding avoids an extra request per view.
const GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

interface TmdbRaw {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

interface TmdbListResponse {
  results: TmdbRaw[];
}

function imageUrl(path: string | null | undefined, size: string): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

function primaryGenre(raw: TmdbRaw): string {
  const fromObjects = raw.genres?.[0]?.name;
  if (fromObjects) return fromObjects;
  const id = raw.genre_ids?.[0];
  return (id != null && GENRES[id]) || '—';
}

function year(raw: TmdbRaw, mediaType: TmdbMediaType): string {
  const date = mediaType === 'movie' ? raw.release_date : raw.first_air_date;
  return date ? date.slice(0, 4) : '—';
}

function buildMetrics(raw: TmdbRaw, mediaType: TmdbMediaType, rating: number): Metric[] {
  const common: Metric[] = [
    { label: 'Genre', value: primaryGenre(raw) },
    { label: 'Year', value: year(raw, mediaType) },
  ];
  if (mediaType === 'movie') {
    common.push({
      label: 'Runtime',
      value: raw.runtime ? `${raw.runtime}m` : `${raw.vote_count ?? 0} votes`,
    });
  } else {
    common.push({
      label: 'Seasons',
      value:
        raw.number_of_seasons != null
          ? String(raw.number_of_seasons)
          : `${raw.vote_count ?? 0} votes`,
    });
  }
  common.push({ label: 'Rating', value: `${rating}/5` });
  return common;
}

export function mapTmdb(raw: TmdbRaw, mediaType: TmdbMediaType): Item {
  const rating = Math.round(((raw.vote_average ?? 0) / 2) * 10) / 10;
  const title = raw.title ?? raw.name ?? 'Untitled';
  return {
    id: encodeId(mediaType, raw.id),
    mediaType,
    externalId: raw.id,
    name: title,
    subtitle: `${year(raw, mediaType)} • ${primaryGenre(raw)}`,
    emoji: EMOJI[mediaType],
    image: imageUrl(raw.poster_path, 'w500'),
    backdrop: imageUrl(raw.backdrop_path, 'w780'),
    rating,
    reviews: raw.vote_count ?? 0,
    overview: raw.overview ?? '',
    metrics: buildMetrics(raw, mediaType, rating),
  };
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', requireTmdbKey());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function getTmdbCatalog(mediaType: TmdbMediaType): Promise<Item[]> {
  const data = await tmdbFetch<TmdbListResponse>(`/trending/${mediaType}/week`, {
    language: 'en-US',
  });
  return data.results.map((raw) => mapTmdb(raw, mediaType));
}

export async function searchTmdb(
  mediaType: TmdbMediaType,
  query: string,
): Promise<Item[]> {
  const data = await tmdbFetch<TmdbListResponse>(`/search/${mediaType}`, {
    language: 'en-US',
    include_adult: 'false',
    query,
  });
  return data.results.map((raw) => mapTmdb(raw, mediaType));
}

export async function getTmdbDetails(
  mediaType: TmdbMediaType,
  externalId: number,
): Promise<Item> {
  const raw = await tmdbFetch<TmdbRaw>(`/${mediaType}/${externalId}`, {
    language: 'en-US',
  });
  return mapTmdb(raw, mediaType);
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl: string | null;
}

const CREW_JOBS = ['Director', 'Writer', 'Screenplay', 'Story'];

interface CreditsResponse {
  cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
  crew: { id: number; name: string; job: string }[];
}

// ---------------------------------------------------------------------------
// Trailers
// ---------------------------------------------------------------------------

interface VideoResult {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

interface VideosResponse {
  results: VideoResult[];
}

export async function fetchTmdbTrailer(
  mediaType: TmdbMediaType,
  externalId: number,
): Promise<string | null> {
  try {
    const data = await tmdbFetch<VideosResponse>(
      `/${mediaType}/${externalId}/videos`,
      { language: 'en-US' },
    );
    // Prefer official trailers, then any trailer
    const official = data.results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official,
    );
    const any = data.results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube',
    );
    return official?.key ?? any?.key ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Watch Providers
// ---------------------------------------------------------------------------

interface WatchProviderRaw {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface WatchProviderRegionRaw {
  link: string;
  flatrate?: WatchProviderRaw[];
  rent?: WatchProviderRaw[];
  buy?: WatchProviderRaw[];
}

interface WatchProvidersResponse {
  id: number;
  results: Record<string, WatchProviderRegionRaw>;
}

export interface ProviderInfo {
  id: number;
  name: string;
  logoUrl: string;
}

export interface WatchOptions {
  link: string;
  flatrate: ProviderInfo[];
  rent: ProviderInfo[];
  buy: ProviderInfo[];
}

function mapProvider(p: WatchProviderRaw): ProviderInfo {
  return {
    id: p.provider_id,
    name: p.provider_name,
    logoUrl: `${IMG_BASE}/w92${p.logo_path}`,
  };
}

export async function fetchTmdbWatchProviders(
  mediaType: TmdbMediaType,
  externalId: number,
  region = 'IN',
): Promise<WatchOptions | null> {
  try {
    const data = await tmdbFetch<WatchProvidersResponse>(
      `/${mediaType}/${externalId}/watch/providers`,
    );
    const regionData = data.results[region];
    if (!regionData) return null;
    return {
      link: regionData.link,
      flatrate: (regionData.flatrate ?? []).sort((a, b) => a.display_priority - b.display_priority).map(mapProvider),
      rent: (regionData.rent ?? []).sort((a, b) => a.display_priority - b.display_priority).map(mapProvider),
      buy: (regionData.buy ?? []).sort((a, b) => a.display_priority - b.display_priority).map(mapProvider),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

export async function fetchTmdbCredits(
  mediaType: TmdbMediaType,
  externalId: number,
): Promise<{ cast: CastMember[]; crew: CrewMember[] }> {
  const data = await tmdbFetch<CreditsResponse>(
    `/${mediaType}/${externalId}/credits`,
    { language: 'en-US' },
  );

  // Cast — top 8 by order
  const cast: CastMember[] = data.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profileUrl: c.profile_path ? `${IMG_BASE}/w185${c.profile_path}` : null,
    }));

  // Crew — Director / Writer, deduped by person
  const personMap = new Map<number, { name: string; jobs: string[] }>();
  for (const c of data.crew) {
    if (CREW_JOBS.includes(c.job)) {
      if (!personMap.has(c.id)) personMap.set(c.id, { name: c.name, jobs: [] });
      personMap.get(c.id)!.jobs.push(c.job);
    }
  }
  const crew: CrewMember[] = Array.from(personMap.entries()).map(([id, { name, jobs }]) => ({
    id,
    name,
    job: jobs[0],
  }));

  return { cast, crew };
}
