import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Item } from '../data/catalog';
import { hasSupabase } from '../lib/env';
import { supabase } from '../lib/supabase';
import {
  addToList,
  fetchContinueWatching,
  fetchList,
  removeFromList,
  upsertContinueWatching,
  type ContinueItem,
  type ListName,
} from '../api/userData';
import { UserDataContext, type UserDataValue } from './userDataContext';

function nameFromUser(user: User | null): string {
  if (!user) return 'User';
  const metaName = (user.user_metadata?.name as string | undefined)?.trim();
  if (metaName) return metaName;
  return user.email?.split('@')[0] ?? 'User';
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(!hasSupabase);
  const [user, setUser] = useState<User | null>(null);
  const [watchlist, setWatchlist] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<Item[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueItem[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadLists = useCallback(async (userId: string) => {
    const [wl, fav, cont] = await Promise.all([
      fetchList('watchlist', userId),
      fetchList('favorites', userId),
      fetchContinueWatching(userId),
    ]);
    setWatchlist(wl);
    setFavorites(fav);
    setContinueWatching(cont);
  }, []);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setFavorites([]);
      setContinueWatching([]);
      return;
    }
    loadLists(user.id).catch((err) => console.error('Failed to load lists', err));
  }, [user, loadLists]);

  const refresh = useCallback(async () => {
    if (user) await loadLists(user.id);
  }, [user, loadLists]);

  const isSaved = useCallback(
    (id: number) => watchlist.some((i) => i.id === id),
    [watchlist],
  );
  const isFavorite = useCallback(
    (id: number) => favorites.some((i) => i.id === id),
    [favorites],
  );

  const toggleGeneric = useCallback(
    async (
      table: ListName,
      list: Item[],
      setList: (items: Item[]) => void,
      item: Item,
    ): Promise<boolean> => {
      if (!user) throw new Error('You must be signed in.');
      const exists = list.some((i) => i.id === item.id);
      if (exists) {
        setList(list.filter((i) => i.id !== item.id));
        await removeFromList(table, user.id, item.id);
        return false;
      }
      setList([item, ...list]);
      await addToList(table, user.id, item);
      return true;
    },
    [user],
  );

  const toggleWatchlist = useCallback(
    (item: Item) => toggleGeneric('watchlist', watchlist, setWatchlist, item),
    [toggleGeneric, watchlist],
  );

  const toggleFavorite = useCallback(
    (item: Item) => toggleGeneric('favorites', favorites, setFavorites, item),
    [toggleGeneric, favorites],
  );

  const recordContinue = useCallback(
    async (item: Item, progress = 0) => {
      if (!user) return;
      await upsertContinueWatching(user.id, item, progress);
      setContinueWatching((prev) => [
        { item, progress },
        ...prev.filter((c) => c.item.id !== item.id),
      ]);
    },
    [user],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<UserDataValue>(
    () => ({
      configured: hasSupabase,
      authReady,
      user,
      displayName: nameFromUser(user),
      watchlist,
      favorites,
      continueWatching,
      isSaved,
      isFavorite,
      toggleWatchlist,
      toggleFavorite,
      recordContinue,
      signIn,
      signUp,
      signOut,
      refresh,
    }),
    [
      authReady,
      user,
      watchlist,
      favorites,
      continueWatching,
      isSaved,
      isFavorite,
      toggleWatchlist,
      toggleFavorite,
      recordContinue,
      signIn,
      signUp,
      signOut,
      refresh,
    ],
  );

  return (
    <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
  );
}
