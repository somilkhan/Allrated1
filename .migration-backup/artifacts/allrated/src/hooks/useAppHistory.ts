import { useCallback, useEffect, useRef, useState } from 'react';
import type { CategoryKey } from '../data/catalog';

export type ScreenName = 'auth' | 'category' | 'app';

export interface AppState {
  screen: ScreenName;
  category?: CategoryKey;
  modal?: number | null;
  panel?: 'saved' | null;
}

export const initialState: AppState = { screen: 'auth' };

export function useAppHistory() {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window !== 'undefined' && window.history.state) {
      return window.history.state as AppState;
    }
    return initialState;
  });

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const current = window.history.state as AppState | null;
    if (!current) {
      window.history.replaceState(initialState, '');
    }

    const onPop = (e: PopStateEvent) => {
      setState(e.state ?? initialState);
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next: AppState) => {
    window.history.pushState(next, '');
    setState(next);
  }, []);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  return { state, navigate, back };
}
