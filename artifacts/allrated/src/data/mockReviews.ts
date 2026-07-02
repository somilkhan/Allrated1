/**
 * Seed / demo reviews shown in the UI when no Supabase is configured,
 * so detail pages look populated during local development and demos.
 *
 * item_id values use the composite encoding from src/api/ids.ts:
 *   movie  = 1_000_000_000 + tmdb_id
 *   tv     = 2_000_000_000 + tmdb_id
 *   anime  = 3_000_000_000 + anilist_id
 *
 * Popular anchor items (likely to appear in trending or search):
 *   Inception (movie, tmdb 27205)        → 1_000_027_205
 *   Interstellar (movie, tmdb 157336)    → 1_000_157_336
 *   The Dark Knight (movie, tmdb 155)    → 1_000_000_155
 *   Breaking Bad (tv, tmdb 1396)         → 2_000_001_396
 *   Attack on Titan (anime, al 16498)    → 3_000_016_498
 */
import type { TierKey } from '../api/userData';

export interface MockReview {
  id: string;
  itemId: number;
  userId: string;
  author: string;
  score: number;
  review: string;
  tier: TierKey;
  createdAt: string;
}

export const MOCK_REVIEWS: MockReview[] = [
  // Inception
  {
    id: 'mock-1',
    itemId: 1_000_027_205,
    userId: 'mock-user-1',
    author: 'dreamwalker',
    score: 5,
    review: 'The layers within layers keep you guessing until the credits. A masterpiece of modern cinema.',
    tier: 'perfection',
    createdAt: '2024-11-10T12:00:00Z',
  },
  {
    id: 'mock-2',
    itemId: 1_000_027_205,
    userId: 'mock-user-2',
    author: 'cinephile_sam',
    score: 4,
    review: 'Brilliantly constructed but the ending debate is still alive. Worth every minute.',
    tier: 'goforit',
    createdAt: '2024-11-08T09:30:00Z',
  },
  // Interstellar
  {
    id: 'mock-3',
    itemId: 1_000_157_336,
    userId: 'mock-user-3',
    author: 'space_nerd',
    score: 5,
    review: "Hans Zimmer's score alone earns this a perfect rating. The black hole scene is breathtaking.",
    tier: 'perfection',
    createdAt: '2024-10-22T15:00:00Z',
  },
  {
    id: 'mock-4',
    itemId: 1_000_157_336,
    userId: 'mock-user-4',
    author: 'casual_moviegoer',
    score: 3,
    review: 'Beautiful visuals but the ending lost me. Good enough for one watch.',
    tier: 'timepass',
    createdAt: '2024-10-19T20:00:00Z',
  },
  // The Dark Knight
  {
    id: 'mock-5',
    itemId: 1_000_000_155,
    userId: 'mock-user-5',
    author: 'gotham_fan',
    score: 5,
    review: "Ledger's Joker is untouchable. The bank heist alone is top 10 all time.",
    tier: 'perfection',
    createdAt: '2024-09-14T10:00:00Z',
  },
  {
    id: 'mock-6',
    itemId: 1_000_000_155,
    userId: 'mock-user-6',
    author: 'not_impressed',
    score: 2,
    review: 'Overrated. Interesting villain, but the rest of the film drags.',
    tier: 'skip',
    createdAt: '2024-09-10T17:00:00Z',
  },
  // Breaking Bad
  {
    id: 'mock-7',
    itemId: 2_000_001_396,
    userId: 'mock-user-7',
    author: 'binge_king',
    score: 5,
    review: "The best TV ever made. Period. Walter White's transformation is unreal.",
    tier: 'perfection',
    createdAt: '2024-08-05T11:00:00Z',
  },
  {
    id: 'mock-8',
    itemId: 2_000_001_396,
    userId: 'mock-user-8',
    author: 'serialaddict',
    score: 4,
    review: 'Season 4 is flawless. The slow build in earlier seasons is worth it.',
    tier: 'goforit',
    createdAt: '2024-08-03T14:00:00Z',
  },
  {
    id: 'mock-9',
    itemId: 2_000_001_396,
    userId: 'mock-user-9',
    author: 'dropped_s2',
    score: 3,
    review: 'Started well but I found it too slow. Might revisit someday.',
    tier: 'timepass',
    createdAt: '2024-08-01T08:00:00Z',
  },
  // Attack on Titan
  {
    id: 'mock-10',
    itemId: 3_000_016_498,
    userId: 'mock-user-10',
    author: 'anime_aficionado',
    score: 5,
    review: 'Changed what I thought anime could be. The final arc is divisive but I loved it.',
    tier: 'perfection',
    createdAt: '2024-07-20T13:00:00Z',
  },
];

/** Returns seed reviews for a given item id (empty array if none). */
export function getMockReviews(itemId: number): MockReview[] {
  return MOCK_REVIEWS.filter((r) => r.itemId === itemId);
}
