import type { Item, MediaType, VerdictKey } from '../data/catalog';
import { requireSupabase } from '../lib/supabase';

export type TierKey = VerdictKey; // 'skip' | 'timepass' | 'goforit' | 'perfection'

export interface TierVoteCounts {
  skip: number;
  timepass: number;
  goforit: number;
  perfection: number;
  total: number;
  myTier: TierKey | null;
}

export type ListName = 'watchlist' | 'favorites';

export interface ContinueItem {
  item: Item;
  progress: number;
}

export interface Rating {
  id: string;
  itemId: number;
  userId: string;
  author: string;
  score: number;
  review: string;
  tier: TierKey | null;
  createdAt: string;
}

interface ListRow {
  item_id: number;
  item: Item;
}

interface ContinueRow {
  item: Item;
  progress: number;
}

interface RatingRow {
  id: string;
  item_id: number;
  user_id: string;
  author: string | null;
  score: number;
  review: string | null;
  tier: string | null;
  created_at: string;
}

interface TierVoteRow {
  user_id: string;
  tier: string;
}

export async function fetchList(table: ListName, userId: string): Promise<Item[]> {
  const { data, error } = await requireSupabase()
    .from(table)
    .select('item_id, item')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ListRow[]).map((row) => row.item);
}

export async function addToList(
  table: ListName,
  userId: string,
  item: Item,
): Promise<void> {
  const { error } = await requireSupabase()
    .from(table)
    .upsert(
      {
        user_id: userId,
        item_id: item.id,
        media_type: item.mediaType,
        item,
      },
      { onConflict: 'user_id,item_id' },
    );
  if (error) throw error;
}

export async function removeFromList(
  table: ListName,
  userId: string,
  itemId: number,
): Promise<void> {
  const { error } = await requireSupabase()
    .from(table)
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId);
  if (error) throw error;
}

export async function fetchContinueWatching(
  userId: string,
): Promise<ContinueItem[]> {
  const { data, error } = await requireSupabase()
    .from('continue_watching')
    .select('item, progress')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as ContinueRow[]).map((row) => ({
    item: row.item,
    progress: row.progress,
  }));
}

export async function upsertContinueWatching(
  userId: string,
  item: Item,
  progress: number,
): Promise<void> {
  const { error } = await requireSupabase().from('continue_watching').upsert(
    {
      user_id: userId,
      item_id: item.id,
      media_type: item.mediaType,
      item,
      progress,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,item_id' },
  );
  if (error) throw error;
}

export async function removeContinueWatching(
  userId: string,
  itemId: number,
): Promise<void> {
  const { error } = await requireSupabase()
    .from('continue_watching')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId);
  if (error) throw error;
}

function mapRating(row: RatingRow): Rating {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    author: row.author ?? 'Someone',
    score: row.score,
    review: row.review ?? '',
    tier: (row.tier as TierKey | null) ?? null,
    createdAt: row.created_at,
  };
}

export async function fetchRatings(itemId: number): Promise<Rating[]> {
  const { data, error } = await requireSupabase()
    .from('ratings')
    .select('id, item_id, user_id, author, score, review, tier, created_at')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RatingRow[]).map(mapRating);
}

export async function fetchTierVotes(
  itemId: number,
  userId?: string,
): Promise<TierVoteCounts> {
  const { data, error } = await requireSupabase()
    .from('tier_votes')
    .select('user_id, tier')
    .eq('item_id', itemId);
  if (error) throw error;
  const counts: TierVoteCounts = { skip: 0, timepass: 0, goforit: 0, perfection: 0, total: 0, myTier: null };
  for (const row of data as TierVoteRow[]) {
    const t = row.tier as TierKey;
    if (t in counts) counts[t]++;
    counts.total++;
    if (userId && row.user_id === userId) counts.myTier = t;
  }
  return counts;
}

export async function upsertTierVote(
  userId: string,
  itemId: number,
  tier: TierKey,
): Promise<void> {
  const { error } = await requireSupabase()
    .from('tier_votes')
    .upsert(
      { user_id: userId, item_id: itemId, tier, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,item_id' },
    );
  if (error) throw error;
}

export async function upsertRating(params: {
  userId: string;
  author: string;
  item: Item;
  score: number;
  review: string;
  tier?: TierKey | null;
}): Promise<void> {
  const { userId, author, item, score, review, tier } = params;
  const { error } = await requireSupabase().from('ratings').upsert(
    {
      user_id: userId,
      author,
      item_id: item.id,
      media_type: item.mediaType as MediaType,
      item,
      score,
      review,
      tier: tier ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,item_id' },
  );
  if (error) throw error;
}
