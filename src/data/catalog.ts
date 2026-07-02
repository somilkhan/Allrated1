export type CategoryKey = 'perfume' | 'movies' | 'anime' | 'skincare';

export type VerdictKey = 'perfection' | 'goforit' | 'timepass' | 'skip';

export interface BaseItem {
  id: number;
  name: string;
  subtitle: string;
  emoji: string;
  rating: number;
  reviews: number;
}

export interface PerfumeItem extends BaseItem {
  longevity: number;
  sillage: number;
  value: number;
}

export interface MovieItem extends BaseItem {
  genre: string;
  year: number;
}

export interface AnimeItem extends BaseItem {
  studio: string;
  episodes: number;
}

export interface SkincareItem extends BaseItem {
  type: string;
  value: number;
}

export type Item = PerfumeItem | MovieItem | AnimeItem | SkincareItem;

export interface Metric {
  label: string;
  value: string;
}

export interface CategoryMeta {
  label: string;
  emoji: string;
  blurb: string;
  accent: string;
  accentLight: string;
  items: Item[];
}

export const categoryData: Record<CategoryKey, CategoryMeta> = {
  perfume: {
    label: 'Perfume',
    emoji: '🫧',
    blurb: 'Scent ratings & reviews',
    accent: '#C9A227',
    accentLight: '#D4AF37',
    items: [
      { id: 1, name: 'Rasasi Hawas', subtitle: 'Amber, Oud', emoji: '🫧', rating: 4.5, reviews: 234, longevity: 8.2, sillage: 8.0, value: 7.2 },
      { id: 2, name: 'Creed Aventus', subtitle: 'Fruity, Spicy', emoji: '🫧', rating: 4.8, reviews: 567, longevity: 9.5, sillage: 9.0, value: 6.5 },
      { id: 3, name: 'Dior Sauvage', subtitle: 'Ambroxan', emoji: '🫧', rating: 4.4, reviews: 891, longevity: 7.8, sillage: 8.5, value: 7.5 },
      { id: 4, name: 'Tom Ford Oud', subtitle: 'Oud, Spice', emoji: '🫧', rating: 4.6, reviews: 445, longevity: 8.8, sillage: 8.2, value: 6.8 },
      { id: 5, name: 'Niche Sandalwood', subtitle: 'Sandalwood', emoji: '🫧', rating: 4.7, reviews: 312, longevity: 9.2, sillage: 7.5, value: 7.0 },
      { id: 6, name: 'Ajmal Wisal', subtitle: 'Oud, Musk', emoji: '🫧', rating: 4.3, reviews: 678, longevity: 8.5, sillage: 8.8, value: 8.5 },
    ],
  },
  movies: {
    label: 'Movies',
    emoji: '🎬',
    blurb: 'Films worth your time',
    accent: '#D64550',
    accentLight: '#FF6B6B',
    items: [
      { id: 101, name: 'Oppenheimer', subtitle: '2023 • Drama', emoji: '🎬', rating: 4.8, reviews: 1243, genre: 'Bio', year: 2023 },
      { id: 102, name: 'Barbie', subtitle: '2023 • Comedy', emoji: '🎬', rating: 4.5, reviews: 2145, genre: 'Comedy', year: 2023 },
      { id: 103, name: 'Killers of the Flower Moon', subtitle: '2023 • Crime', emoji: '🎬', rating: 4.7, reviews: 987, genre: 'Crime', year: 2023 },
      { id: 104, name: 'Dune Part Two', subtitle: '2024 • Sci-Fi', emoji: '🎬', rating: 4.6, reviews: 1567, genre: 'Sci-Fi', year: 2024 },
      { id: 105, name: 'Inception', subtitle: '2010 • Thriller', emoji: '🎬', rating: 4.9, reviews: 3421, genre: 'Thriller', year: 2010 },
      { id: 106, name: 'Dark Knight', subtitle: '2008 • Action', emoji: '🎬', rating: 4.9, reviews: 4231, genre: 'Action', year: 2008 },
    ],
  },
  anime: {
    label: 'Anime',
    emoji: '⛩️',
    blurb: 'Series, ranked by fans',
    accent: '#9370DB',
    accentLight: '#B19CD9',
    items: [
      { id: 201, name: 'Attack on Titan', subtitle: '4 Seasons', emoji: '⛩️', rating: 4.8, reviews: 5432, studio: 'WIT', episodes: 87 },
      { id: 202, name: 'Death Note', subtitle: '2 Seasons', emoji: '⛩️', rating: 4.7, reviews: 4321, studio: 'Madhouse', episodes: 37 },
      { id: 203, name: 'Demon Slayer', subtitle: '4 Seasons', emoji: '⛩️', rating: 4.9, reviews: 6543, studio: 'ufotable', episodes: 67 },
      { id: 204, name: 'My Hero Academia', subtitle: '7 Seasons', emoji: '⛩️', rating: 4.6, reviews: 4876, studio: 'Bones', episodes: 187 },
      { id: 205, name: 'Fullmetal Alchemist', subtitle: '2 Seasons', emoji: '⛩️', rating: 4.9, reviews: 5234, studio: 'Bones', episodes: 51 },
      { id: 206, name: 'Jujutsu Kaisen', subtitle: '2 Seasons', emoji: '⛩️', rating: 4.8, reviews: 7654, studio: 'MAPPA', episodes: 47 },
    ],
  },
  skincare: {
    label: 'Skincare',
    emoji: '🧴',
    blurb: 'Find your next staple',
    accent: '#E08FA0',
    accentLight: '#FF9DC6',
    items: [
      { id: 301, name: 'Minimalist Moisturizer', subtitle: 'Gel', emoji: '🧴', rating: 4.6, reviews: 543, type: 'Hydrating', value: 9.0 },
      { id: 302, name: 'Cetaphil Cleanser', subtitle: 'Gentle', emoji: '🧴', rating: 4.7, reviews: 1234, type: 'Cleanser', value: 8.0 },
      { id: 303, name: 'The Ordinary Niacinamide', subtitle: '10%', emoji: '🧴', rating: 4.4, reviews: 2345, type: 'Serum', value: 9.5 },
      { id: 304, name: 'Hyalu B5 Serum', subtitle: 'Hydrating', emoji: '🧴', rating: 4.8, reviews: 876, type: 'Serum', value: 7.5 },
      { id: 305, name: 'Sunscreen SPF 50', subtitle: 'UV Guard', emoji: '🧴', rating: 4.5, reviews: 1567, type: 'Protection', value: 8.2 },
      { id: 306, name: 'Retinol Night Cream', subtitle: 'Anti-aging', emoji: '🧴', rating: 4.6, reviews: 432, type: 'Treatment', value: 7.8 },
    ],
  },
};

export const categoryOrder: CategoryKey[] = ['perfume', 'movies', 'anime', 'skincare'];

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

export function getMetrics(item: Item, cat: CategoryKey): Metric[] {
  switch (cat) {
    case 'perfume': {
      const p = item as PerfumeItem;
      return [
        { label: 'Longevity', value: `${p.longevity}h` },
        { label: 'Sillage', value: `${p.sillage}/10` },
        { label: 'Value', value: `${p.value}/10` },
        { label: 'Rating', value: `${p.rating}/5` },
      ];
    }
    case 'movies': {
      const m = item as MovieItem;
      return [
        { label: 'Genre', value: m.genre },
        { label: 'Year', value: String(m.year) },
        { label: 'Votes', value: `${m.reviews}k` },
        { label: 'Rating', value: `${m.rating}/5` },
      ];
    }
    case 'anime': {
      const a = item as AnimeItem;
      return [
        { label: 'Studio', value: a.studio },
        { label: 'Episodes', value: String(a.episodes) },
        { label: 'Status', value: 'Aired' },
        { label: 'Rating', value: `${a.rating}/5` },
      ];
    }
    case 'skincare': {
      const s = item as SkincareItem;
      return [
        { label: 'Type', value: s.type },
        { label: 'Value', value: `${s.value}/10` },
        { label: 'Reviews', value: String(s.reviews) },
        { label: 'Rating', value: `${s.rating}/5` },
      ];
    }
  }
}

export function starsFor(rating: number, total = 5): string {
  const full = Math.floor(rating);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, total - full));
}
