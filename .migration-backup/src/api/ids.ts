import type { MediaType } from '../data/catalog';

/**
 * Items come from different sources (TMDB movies, TMDB TV, AniList anime) whose
 * ids can collide. We encode a single stable numeric id by offsetting each
 * source into its own billion-range. Source ids are far below 1e9.
 */
const OFFSET: Record<MediaType, number> = {
  movie: 1_000_000_000,
  tv: 2_000_000_000,
  anime: 3_000_000_000,
};

const ORDER: MediaType[] = ['movie', 'tv', 'anime'];

export function encodeId(mediaType: MediaType, externalId: number): number {
  return OFFSET[mediaType] + externalId;
}

export function decodeId(id: number): { mediaType: MediaType; externalId: number } {
  for (let i = ORDER.length - 1; i >= 0; i -= 1) {
    const mediaType = ORDER[i];
    if (id >= OFFSET[mediaType]) {
      return { mediaType, externalId: id - OFFSET[mediaType] };
    }
  }
  return { mediaType: 'movie', externalId: id };
}
