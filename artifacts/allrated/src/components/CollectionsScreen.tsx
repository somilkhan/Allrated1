import { useState } from 'react';
import { Plus, Globe, Heart, Bookmark } from 'lucide-react';
import type { Item } from '../data/catalog';

interface CollectionsScreenProps {
  watchlist: Item[];
  onOpenItem: (item: Item) => void;
  onToast: (msg: string) => void;
}

type CollectionsTab = 'discover' | 'my' | 'saved';

const DISCOVER_COLLECTIONS = [
  { id: 1, name: 'Laugh In Under 30 Minutes', items: 20, likes: 18, coverUrl: 'https://image.tmdb.org/t/p/w500/d54UD0hPVBUR5Q0gR0d4T3LRO5r.jpg', creatorInitial: 'F' },
  { id: 2, name: 'Films & Shows About Filmmaking', items: 29, likes: 28, coverUrl: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bAY4deQuBmfjsZQV.jpg', creatorInitial: 'R' },
  { id: 3, name: 'Korean Horror & Supernatural', items: 3, likes: 0, coverUrl: null, creatorInitial: 'K' },
  { id: 4, name: 'Webtoon Based K-Dramas', items: 14, likes: 1, coverUrl: null, creatorInitial: 'Z' },
  { id: 5, name: 'Mind-Bending Thrillers', items: 18, likes: 5, coverUrl: null, creatorInitial: 'M' },
  { id: 6, name: 'Best of 2026 Bollywood', items: 7, likes: 2, coverUrl: null, creatorInitial: 'B' },
];

export default function CollectionsScreen({ watchlist, onOpenItem, onToast }: CollectionsScreenProps) {
  const [tab, setTab] = useState<CollectionsTab>('discover');

  const tabs: { key: CollectionsTab; label: string }[] = [
    { key: 'discover', label: 'Discover' },
    { key: 'my', label: 'My Collections' },
    { key: 'saved', label: 'Saved' },
  ];

  return (
    <div className="px-4 pt-2">
      <div className="mb-4 flex border-b border-white/[0.08]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-[13px] font-semibold transition-all ${
              tab === t.key
                ? 'border-b-2 border-white text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'discover' && (
        <div>
          {DISCOVER_COLLECTIONS.map((col) => (
            <CollectionCard
              key={col.id}
              name={col.name}
              itemCount={col.items}
              likes={col.likes}
              coverUrl={col.coverUrl}
              creatorInitial={col.creatorInitial}
              onClick={() => onToast(`Opening: ${col.name}`)}
            />
          ))}
        </div>
      )}

      {tab === 'my' && (
        <div>
          {watchlist.length === 0 ? (
            <EmptyCollections onToast={onToast} />
          ) : (
            <>
              <CollectionCard
                name="My Watchlist"
                itemCount={watchlist.length}
                likes={0}
                coverUrl={watchlist[0]?.image || null}
                creatorInitial="Y"
                onClick={() => onToast('Your watchlist')}
              />
              {watchlist.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onOpenItem(item)}
                  className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#1A1B1F] p-3 text-left hover:bg-[#21222A] transition-colors"
                >
                  <div className="h-14 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{item.subtitle}</p>
                  </div>
                  <Bookmark className="h-4 w-4 text-white/30 flex-shrink-0" />
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div>
          {DISCOVER_COLLECTIONS.slice(0, 2).map((col) => (
            <CollectionCard
              key={col.id}
              name={col.name}
              itemCount={col.items}
              likes={col.likes}
              coverUrl={col.coverUrl}
              creatorInitial={col.creatorInitial}
              onClick={() => onToast(`Opening: ${col.name}`)}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => onToast('Create new collection')}
        className="fixed bottom-[80px] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 shadow-[0_8px_24px_rgba(124,58,237,0.45)] hover:bg-purple-700 transition-all active:scale-95"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}

function CollectionCard({
  name,
  itemCount,
  likes,
  coverUrl,
  creatorInitial,
  onClick,
}: {
  name: string;
  itemCount: number;
  likes: number;
  coverUrl: string | null;
  creatorInitial: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mb-5 w-full text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
    >
      <div className="aspect-[16/7] w-full rounded-2xl bg-[#1A1B1F] border border-white/[0.08] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-white/10 font-black text-5xl uppercase">{creatorInitial}</span>
          </div>
        )}
      </div>
      <div className="mt-2.5 px-0.5">
        <p className="font-semibold text-[14px] text-white">{name}</p>
        <div className="mt-1 flex items-center gap-2 text-[12px] text-white/35">
          <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/60">{creatorInitial}</span>
          </div>
          <Globe className="h-3 w-3" />
          <span>•</span>
          <span>{itemCount} Items</span>
          <span>•</span>
          <Heart className="h-3 w-3" />
          <span>{likes} like</span>
        </div>
      </div>
    </button>
  );
}

function EmptyCollections({ onToast }: { onToast: (msg: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Bookmark className="h-12 w-12 text-white/15 mb-4" />
      <p className="text-white/50 text-[14px] font-semibold mb-1">No collections yet</p>
      <p className="text-white/30 text-[13px] mb-5">Create your first collection or save others</p>
      <button
        onClick={() => onToast('Create new collection')}
        className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
      >
        + Create Collection
      </button>
    </div>
  );
}
