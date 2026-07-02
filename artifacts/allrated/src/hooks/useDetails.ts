import { useEffect, useState } from 'react';
import type { Item } from '../data/catalog';
import { getDetails } from '../api/media';
import { decodeId } from '../api/ids';

interface DetailsState {
  item: Item | null;
  loading: boolean;
  error: string | null;
}

export function useDetails(id: number | null): DetailsState {
  const [state, setState] = useState<DetailsState>({
    item: null,
    loading: id != null,
    error: null,
  });

  useEffect(() => {
    if (id == null) {
      setState({ item: null, loading: false, error: null });
      return;
    }
    let active = true;
    setState({ item: null, loading: true, error: null });
    const { mediaType, externalId } = decodeId(id);
    getDetails(mediaType, externalId)
      .then((item) => {
        if (active) setState({ item, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            item: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load details',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
