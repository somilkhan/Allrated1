import type { Item, MediaType } from '../data/catalog';
import { requireSupabase } from '../lib/supabase';

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
  created_at: string;
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
    createdAt: row.created_at,
  };
}

export async function fetchRatings(itemId: number): Promise<Rating[]> {
  const { data, error } = await requireSupabase()
    .from('ratings')
    .select('id, item_id, user_id, author, score, review, created_at')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RatingRow[]).map(mapRating);
}

export async function upsertRating(params: {
  userId: string;
  author: string;
  item: Item;
  score: number;
  review: string;
}): Promise<void> {
  const { userId, author, item, score, review } = params;
  const { error } = await requireSupabase().from('ratings').upsert(
    {
      user_id: userId,
      author,
      item_id: item.id,
      media_type: item.mediaType as MediaType,
      item,
      score,
      review,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,item_id' },
  );
  if (error) throw error;
}
