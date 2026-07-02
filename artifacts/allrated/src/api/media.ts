import type { CategoryKey, Item, MediaType } from '../data/catalog';
import {
  getAniListCatalog,
  getAniListDetails,
  searchAniList,
} from './anilist';
import {
  getTmdbCatalog,
  getTmdbDetails,
  searchTmdb,
} from './tmdb';

/** Fetch the home-feed catalog for a category from its live source. */
export function getCatalog(category: CategoryKey): Promise<Item[]> {
  if (category === 'anime') return getAniListCatalog();
  return getTmdbCatalog(category);
}

/** Search a single category's live source. */
export function searchCatalog(
  category: CategoryKey,
  query: string,
): Promise<Item[]> {
  const q = query.trim();
  if (!q) return Promise.resolve([]);
  if (category === 'anime') return searchAniList(q);
  return searchTmdb(category, q);
}

/** Fetch full details for a single item. */
export function getDetails(
  mediaType: MediaType,
  externalId: number,
): Promise<Item> {
  if (mediaType === 'anime') return getAniListDetails(externalId);
  return getTmdbDetails(mediaType, externalId);
}
