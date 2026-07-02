import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Item } from '../data/catalog';
import type { ContinueItem } from '../api/userData';

export interface UserDataValue {
  configured: boolean;
  authReady: boolean;
  user: User | null;
  displayName: string;
  watchlist: Item[];
  favorites: Item[];
  continueWatching: ContinueItem[];
  isSaved: (id: number) => boolean;
  isFavorite: (id: number) => boolean;
  toggleWatchlist: (item: Item) => Promise<boolean>;
  toggleFavorite: (item: Item) => Promise<boolean>;
  recordContinue: (item: Item, progress?: number) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const UserDataContext = createContext<UserDataValue | null>(null);

export function useUserData(): UserDataValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return ctx;
}
