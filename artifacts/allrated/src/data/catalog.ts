export type CategoryKey = 'movie' | 'tv' | 'anime';

export type MediaType = CategoryKey;

export type VerdictKey = 'perfection' | 'goforit' | 'timepass' | 'skip';

export interface Metric {
  label: string;
  value: string;
}

export interface Item {
  /** Composite numeric id, unique across sources. See src/api/ids.ts */
  id: number;
  mediaType: MediaType;
  /** Original id in the source API (TMDB / AniList). */
  externalId: number;
  name: string;
  subtitle: string;
  emoji: string;
  image: string | null;
  backdrop: string | null;
  /** Normalized rating on a 0-5 scale. */
  rating: number;
  /** Number of votes/ratings behind the score. */
  reviews: number;
  overview: string;
  metrics: Metric[];
}

export interface CategoryMeta {
  label: string;
  emoji: string;
  blurb: string;
  accent: string;
  accentLight: string;
}

export const categoryData: Record<CategoryKey, CategoryMeta> = {
  movie: {
    label: 'Movies',
    emoji: '🎬',
    blurb: 'Films worth your time',
    accent: '#D64550',
    accentLight: '#FF6B6B',
  },
  tv: {
    label: 'TV Shows',
    emoji: '📺',
    blurb: 'Series worth bingeing',
    accent: '#0EA5E9',
    accentLight: '#38BDF8',
  },
  anime: {
    label: 'Anime',
    emoji: '⛩️',
    blurb: 'Series, ranked by fans',
    accent: '#9370DB',
    accentLight: '#B19CD9',
  },
};

export const categoryOrder: CategoryKey[] = ['movie', 'tv', 'anime'];

export function getVerdict(rating: number): { label: string; key: VerdictKey } {
  if (rating >= 4.7) return { label: 'Perfection', key: 'perfection' };
  if (rating >= 4.3) return { label: 'Go for it', key: 'goforit' };
  if (rating >= 3.8) return { label: 'Timepass', key: 'timepass' };
  return { label: 'Skip', key: 'skip' };
}

export const verdictStyles: Record<VerdictKey, string> = {
  perfection: 'bg-violet-500/85 text-white',
  goforit: 'bg-emerald-500/85 text-white',
  timepass: 'bg-amber-500/90 text-ink-900',
  skip: 'bg-rose-500/85 text-white',
};

export function getMetrics(item: Item): Metric[] {
  return item.metrics;
}

export function starsFor(rating: number, total = 5): string {
  const full = Math.floor(rating);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, total - full));
}
