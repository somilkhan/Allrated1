import { useEffect, useState } from 'react';
import type { Item } from '../data/catalog';
import { decodeId } from '../api/ids';
import { getTmdbExtended, type TmdbExtended } from '../api/tmdb';
import { getAniListDetails } from '../api/anilist';

export type DetailFull =
  | ({ kind: 'tmdb' } & TmdbExtended)
  | { kind: 'anime'; item: Item };

interface State {
  data: DetailFull | null;
  loading: boolean;
  error: string | null;
}

export function useDetailFull(id: number | null): State {
  const [state, setState] = useState<State>({
    data: null,
    loading: id != null,
    error: null,
  });

  useEffect(() => {
    if (id == null) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let active = true;
    setState({ data: null, loading: true, error: null });

    const { mediaType, externalId } = decodeId(id);

    if (mediaType === 'anime') {
      getAniListDetails(externalId)
        .then((item) => {
          if (active) setState({ data: { kind: 'anime', item }, loading: false, error: null });
        })
        .catch((err: unknown) => {
          if (active)
            setState({
              data: null,
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to load',
            });
        });
    } else {
      getTmdbExtended(mediaType, externalId)
        .then((ext) => {
          if (active) setState({ data: { kind: 'tmdb', ...ext }, loading: false, error: null });
        })
        .catch((err: unknown) => {
          if (active)
            setState({
              data: null,
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to load',
            });
        });
    }

    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
