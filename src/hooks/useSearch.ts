import { useEffect, useState } from 'react';
import type { CategoryKey, Item } from '../data/catalog';
import { searchCatalog } from '../api/media';

interface SearchState {
  results: Item[];
  loading: boolean;
  error: string | null;
}

export function useSearch(category: CategoryKey, query: string): SearchState {
  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setState({ results: [], loading: false, error: null });
      return;
    }
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const timer = window.setTimeout(() => {
      searchCatalog(category, trimmed)
        .then((results) => {
          if (active) setState({ results, loading: false, error: null });
        })
        .catch((err: unknown) => {
          if (active) {
            setState({
              results: [],
              loading: false,
              error: err instanceof Error ? err.message : 'Search failed',
            });
          }
        });
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [category, query]);

  return state;
}
