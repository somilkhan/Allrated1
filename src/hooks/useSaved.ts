import { useCallback, useState } from 'react';

export function useSaved() {
  const [saved, setSaved] = useState<number[]>([]);

  const toggle = useCallback((id: number) => {
    setSaved((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return [...prev, id];
      return prev.filter((x) => x !== id);
    });
  }, []);

  const isSaved = useCallback((id: number) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved, count: saved.length };
}
