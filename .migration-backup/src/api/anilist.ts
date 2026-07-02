import type { Item, Metric } from '../data/catalog';
import { encodeId } from './ids';

const ENDPOINT = 'https://graphql.anilist.co';
const EMOJI = '⛩️';

const MEDIA_FIELDS = `
  id
  title { romaji english }
  description(asHtml: false)
  coverImage { large }
  bannerImage
  averageScore
  popularity
  episodes
  format
  status
  seasonYear
  genres
  studios(isMain: true) { nodes { name } }
`;

interface AniListMedia {
  id: number;
  title: { romaji: string | null; english: string | null };
  description: string | null;
  coverImage: { large: string | null } | null;
  bannerImage: string | null;
  averageScore: number | null;
  popularity: number | null;
  episodes: number | null;
  format: string | null;
  status: string | null;
  seasonYear: number | null;
  genres: string[] | null;
  studios: { nodes: { name: string }[] } | null;
}

function prettify(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function statusLabel(status: string | null): string {
  switch (status) {
    case 'FINISHED':
      return 'Finished';
    case 'RELEASING':
      return 'Airing';
    case 'NOT_YET_RELEASED':
      return 'Upcoming';
    case 'CANCELLED':
      return 'Cancelled';
    case 'HIATUS':
      return 'Hiatus';
    default:
      return '—';
  }
}

function stripHtml(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function mapAniList(media: AniListMedia): Item {
  const rating = Math.round(((media.averageScore ?? 0) / 20) * 10) / 10;
  const name = media.title.english || media.title.romaji || 'Untitled';
  const studio = media.studios?.nodes?.[0]?.name ?? '—';
  const yearLabel = media.seasonYear ? String(media.seasonYear) : '—';
  const metrics: Metric[] = [
    { label: 'Studio', value: studio },
    { label: 'Episodes', value: media.episodes != null ? String(media.episodes) : '—' },
    { label: 'Status', value: statusLabel(media.status) },
    { label: 'Rating', value: `${rating}/5` },
  ];
  return {
    id: encodeId('anime', media.id),
    mediaType: 'anime',
    externalId: media.id,
    name,
    subtitle: `${yearLabel} • ${prettify(media.format)}`,
    emoji: EMOJI,
    image: media.coverImage?.large ?? null,
    backdrop: media.bannerImage ?? null,
    rating,
    reviews: media.popularity ?? 0,
    overview: stripHtml(media.description),
    metrics,
  };
}

async function aniListFetch<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`AniList request failed (${res.status})`);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`AniList error: ${json.errors[0].message}`);
  }
  if (!json.data) {
    throw new Error('AniList returned no data');
  }
  return json.data;
}

export async function getAniListCatalog(): Promise<Item[]> {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_FIELDS} }
      }
    }
  `;
  const data = await aniListFetch<{ Page: { media: AniListMedia[] } }>(query, {});
  return data.Page.media.map(mapAniList);
}

export async function searchAniList(query: string): Promise<Item[]> {
  const gql = `
    query ($search: String) {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, search: $search, sort: SEARCH_MATCH, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await aniListFetch<{ Page: { media: AniListMedia[] } }>(gql, {
    search: query,
  });
  return data.Page.media.map(mapAniList);
}

export async function getAniListDetails(externalId: number): Promise<Item> {
  const gql = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} }
    }
  `;
  const data = await aniListFetch<{ Media: AniListMedia }>(gql, { id: externalId });
  return mapAniList(data.Media);
}
