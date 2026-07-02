import { X, Bookmark } from 'lucide-react';
import { RankCard } from './Cards';
import type { Item } from '../data/catalog';

interface SavedPanelProps {
  items: Item[];
  onClose: () => void;
  onOpenItem: (item: Item) => void;
}

export function SavedPanel({ items, onClose, onOpenItem }: SavedPanelProps) {
  return (
    <div className="fixed inset-0 z-[300]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-[380px] animate-slide-in-right overflow-y-auto border-l border-white/[0.09] bg-ink-600 p-6 thin-scrollbar">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">Saved</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.045] text-white transition-all hover:bg-white/[0.08]"
            aria-label="Close saved"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="mt-20 text-center text-white/55">
            <Bookmark className="mx-auto mb-3 h-7 w-7 opacity-60" />
            <p className="text-[13px]">No saved items yet. Tap the bookmark on any item to save it here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <RankCard
                key={item.id}
                item={item}
                rank={null}
                onClick={() => onOpenItem(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
