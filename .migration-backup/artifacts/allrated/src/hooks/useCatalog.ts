import { useEffect, useState } from 'react';
import type { CategoryKey, Item } from '../data/catalog';
import { getCatalog } from '../api/media';

interface CatalogState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

export function useCatalog(category: CategoryKey): CatalogState {
  const [state, setState] = useState<CatalogState>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ items: [], loading: true, error: null });
    getCatalog(category)
      .then((items) => {
        if (active) setState({ items, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            items: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load catalog',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [category]);

  return state;
}
