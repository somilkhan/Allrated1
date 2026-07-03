import { useState, useRef } from 'react';
import {
  Search,
  Bell,
  MoreVertical,
  Compass,
  CalendarDays,
  Coffee,
  Bookmark,
  Flame,
  Megaphone,
  Loader2,
  Frown,
  ChevronDown,
  X,
} from 'lucide-react';
import type { CategoryKey, Item } from '../data/catalog';
import { useCatalog } from '../hooks/useCatalog';
import { useSearch } from '../hooks/useSearch';
import { useUserData } from '../context/userDataContext';
import SpacesScreen from './SpacesScreen';
import CollectionsScreen from './CollectionsScreen';
import ProfileScreen from './ProfileScreen';

interface AppScreenProps {
  cat: CategoryKey;
  onBackToCategories: () => void;
  onOpenItem: (item: Item) => void;
  onOpenSaved: () => void;
  onToast: (msg: string) => void;
}

type NavTab = 'explore' | 'browse' | 'spaces' | 'collections' | 'profile';

const RECENT_SEARCHES = ['Blast', 'Dhurandhar', 'KGF'];

export function AppScreen({ cat, onBackToCategories, onOpenItem, onOpenSaved, onToast }: AppScreenProps) {
  const [nav, setNav] = useState<NavTab>('explore');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [browseCat, setBrowseCat] = useState<CategoryKey>(cat);
  const [weekFilter, setWeekFilter] = useState<'This Week' | 'This Month'>('This Week');
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES);

  const { displayName, watchlist, signOut } = useUserData();

  const { items, loading, error } = useCatalog('movie');
  const browseCatalog = useCatalog(browseCat);
  const search = useSearch('movie', query);
  const searching = query.trim().length > 0;

  const topItems = [...items].sort((a, b) => b.reviews - a.reviews).slice(0, 10);
  const talkItems = items.slice(0, 8);

  const handleSignOut = () => {
    signOut()
      .then(() => onToast('Signed out'))
      .catch(() => onToast('Failed to sign out'));
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const handleOpenItem = (item: Item) => {
    if (searchOpen) handleCloseSearch();
    onOpenItem(item);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0F1014] text-white">
      <MoctaleHeader
        onSearchOpen={() => setSearchOpen(true)}
        onNotification={() => onToast('No new notifications')}
        onMenu={handleSignOut}
      />

      <div className="flex-1 overflow-y-auto pb-[72px]">
        {nav === 'explore' && (
          <ExplorePage
            items={items}
            topItems={topItems}
            talkItems={talkItems}
            loading={loading}
            error={error}
            weekFilter={weekFilter}
            onWeekFilter={setWeekFilter}
            onOpenItem={handleOpenItem}
            onToast={onToast}
          />
        )}
        {nav === 'browse' && (
          <BrowsePage
            cat={browseCat}
            onCatChange={setBrowseCat}
            items={browseCatalog.items}
            loading={browseCatalog.loading}
            error={browseCatalog.error}
            onOpenItem={handleOpenItem}
          />
        )}
        {nav === 'spaces' && <SpacesScreen onToast={onToast} />}
        {nav === 'collections' && (
          <CollectionsScreen watchlist={watchlist} onOpenItem={handleOpenItem} onToast={onToast} />
        )}
        {nav === 'profile' && (
          <ProfileScreen displayName={displayName} onSignOut={handleSignOut} onToast={onToast} />
        )}
      </div>

      <BottomNav nav={nav} onNav={setNav} />

      {/* Full-page Moctale search overlay */}
      {searchOpen && (
        <FullSearchScreen
          query={query}
          onQuery={setQuery}
          onClose={handleCloseSearch}
          searchResults={search.results}
          searchLoading={search.loading}
          searching={searching}
          recentSearches={recentSearches}
          onRemoveRecent={(s) => setRecentSearches((prev) => prev.filter((r) => r !== s))}
          onClearRecent={() => setRecentSearches([])}
          onSelectRecent={(s) => setQuery(s)}
          onOpenItem={handleOpenItem}
        />
      )}
    </div>
  );
}

function MoctaleHeader({
  onSearchOpen,
  onNotification,
  onMenu,
}: {
  onSearchOpen: () => void;
  onNotification: () => void;
  onMenu: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3.5 bg-[#0F1014]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
          <span className="text-[#0F1014] font-black text-sm leading-none">AR</span>
        </div>
        <span className="text-white font-black text-[17px] tracking-wider uppercase">AllRated</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSearchOpen} aria-label="Search" className="text-white/70 hover:text-white transition-colors">
          <Search className="h-5 w-5" />
        </button>
        <button onClick={onNotification} aria-label="Notifications" className="text-white/70 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button onClick={onMenu} aria-label="Menu" className="text-white/70 hover:text-white transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

/* ── Full-page Search Screen (matches Moctale /search) ── */
const SEARCH_TABS = ['Content', 'Collections', 'Cast & Crew', 'Users'];

function FullSearchScreen({
  query,
  onQuery,
  onClose,
  searchResults,
  searchLoading,
  searching,
  recentSearches,
  onRemoveRecent,
  onClearRecent,
  onSelectRecent,
  onOpenItem,
}: {
  query: string;
  onQuery: (v: string) => void;
  onClose: () => void;
  searchResults: Item[];
  searchLoading: boolean;
  searching: boolean;
  recentSearches: string[];
  onRemoveRecent: (s: string) => void;
  onClearRecent: () => void;
  onSelectRecent: (s: string) => void;
  onOpenItem: (item: Item) => void;
}) {
  const [activeTab, setActiveTab] = useState('Content');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0F1014] text-white">
      {/* Search bar row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors flex-shrink-0">
          <X className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search for Movies, Shows, Anime, Cast &"
            className="w-full rounded-xl border border-white/10 bg-[#1A1B1F] py-2.5 pl-9 pr-4 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] px-1">
        {SEARCH_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3.5 py-3 text-[13px] font-semibold transition-all whitespace-nowrap ${
              activeTab === t
                ? 'border-b-2 border-white text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!searching ? (
          /* Recent searches */
          <div className="px-4 pt-5">
            {recentSearches.length > 0 && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Recent Searches</span>
                  <button
                    onClick={onClearRecent}
                    className="text-[12px] text-white/40 hover:text-white transition-colors"
                  >
                    Clear history
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <div key={s} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5">
                      <button
                        onClick={() => onSelectRecent(s)}
                        className="text-[13px] text-white/80 hover:text-white transition-colors"
                      >
                        {s}
                      </button>
                      <button
                        onClick={() => onRemoveRecent(s)}
                        className="ml-1 text-white/30 hover:text-white/70 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {recentSearches.length === 0 && (
              <p className="py-12 text-center text-[13px] text-white/30">Search for movies, shows, anime, and more</p>
            )}
          </div>
        ) : searchLoading ? (
          <LoadingState />
        ) : searchResults.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-white/40">No results for "{query}"</div>
        ) : (
          <div className="px-4 pt-4">
            <p className="mb-3 text-[13px] font-semibold text-white/40">{searchResults.length} results for "{query}"</p>
            {activeTab === 'Content' && (
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((item) => (
                  <TalkCard key={item.id} item={item} onClick={() => onOpenItem(item)} />
                ))}
              </div>
            )}
            {activeTab !== 'Content' && (
              <p className="py-12 text-center text-[13px] text-white/30">No {activeTab} results</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ExplorePageProps {
  items: Item[];
  topItems: Item[];
  talkItems: Item[];
  loading: boolean;
  error: string | null;
  weekFilter: 'This Week' | 'This Month';
  onWeekFilter: (v: 'This Week' | 'This Month') => void;
  onOpenItem: (item: Item) => void;
  onToast: (msg: string) => void;
}

function ExplorePage({
  items,
  topItems,
  talkItems,
  loading,
  error,
  weekFilter,
  onWeekFilter,
  onOpenItem,
}: ExplorePageProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="px-4 pt-2">
      <MostInterestedSection items={topItems} weekFilter={weekFilter} onWeekFilter={onWeekFilter} onOpenItem={onOpenItem} />
      <TalkOfTheTownSection items={talkItems} onOpenItem={onOpenItem} />
    </div>
  );
}

function MostInterestedSection({
  items,
  weekFilter,
  onWeekFilter,
  onOpenItem,
}: {
  items: Item[];
  weekFilter: 'This Week' | 'This Month';
  onWeekFilter: (v: 'This Week' | 'This Month') => void;
  onOpenItem: (item: Item) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[16px] font-bold text-white">
          <Flame className="h-4 w-4 text-orange-400" />
          Most Interested
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/[0.12] transition-colors"
          >
            {weekFilter}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border border-white/10 bg-[#1A1B1F] shadow-xl overflow-hidden">
              {(['This Week', 'This Month'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onWeekFilter(opt); setShowDropdown(false); }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {items.slice(0, 8).map((item, idx) => (
          <RankedCard key={item.id} item={item} rank={idx + 1} onClick={() => onOpenItem(item)} />
        ))}
      </div>
    </section>
  );
}

function RankedCard({ item, rank, onClick }: { item: Item; rank: number; onClick: () => void }) {
  const interestedCount = Math.floor(item.reviews * 0.4 + rank * 50);
  const displayCount =
    interestedCount >= 1000
      ? (interestedCount / 1000).toFixed(1) + 'K'
      : String(interestedCount);

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#1A1B1F] p-3 text-left transition-all hover:border-white/20 hover:bg-[#21222A] active:scale-95"
      style={{ width: '230px' }}
    >
      <span className="text-[36px] font-black text-white/20 leading-none w-8 text-center">{rank}</span>
      <div
        className="h-14 w-10 flex-shrink-0 rounded-lg bg-white/10 overflow-hidden"
        style={{ background: item.image ? undefined : '#2a2a30' }}
      >
        {item.image && (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] text-white truncate">{item.name}</p>
        <p className="text-[11px] text-white/40 mt-0.5 truncate">{item.subtitle}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Flame className="h-3 w-3 text-orange-400" />
          <span className="text-[11px] font-semibold text-orange-400">{displayCount} Interested</span>
        </div>
      </div>
    </button>
  );
}

function TalkOfTheTownSection({ items, onOpenItem }: { items: Item[]; onOpenItem: (item: Item) => void }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 flex items-center gap-2 text-[16px] font-bold text-white">
        <Megaphone className="h-4 w-4 text-white/80" />
        Talk Of The Town
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <TalkCard key={item.id} item={item} onClick={() => onOpenItem(item)} />
        ))}
      </div>
    </section>
  );
}

function TalkCard({ item, onClick }: { item: Item; onClick: () => void }) {
  const label = item.mediaType === 'movie' ? 'New Movie' : item.mediaType === 'tv' ? 'New Series' : 'New Anime';
  return (
    <button
      onClick={onClick}
      className="flex flex-col rounded-2xl overflow-hidden bg-[#1A1B1F] text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="aspect-[2/3] w-full bg-[#2a2a30] overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/20 text-3xl">{item.emoji}</div>
        )}
      </div>
      <div className="px-2.5 py-2.5">
        <p className="font-semibold text-[13px] text-white leading-tight line-clamp-2">{item.name}</p>
        <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
      </div>
    </button>
  );
}

interface BrowsePageProps {
  cat: CategoryKey;
  onCatChange: (c: CategoryKey) => void;
  items: Item[];
  loading: boolean;
  error: string | null;
  onOpenItem: (item: Item) => void;
}

function BrowsePage({ cat, onCatChange, items, loading, error, onOpenItem }: BrowsePageProps) {
  const tabs: { key: CategoryKey; label: string }[] = [
    { key: 'movie', label: 'Movies' },
    { key: 'tv', label: 'TV Shows' },
    { key: 'anime', label: 'Anime' },
  ];

  return (
    <div className="px-4 pt-2">
      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onCatChange(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              cat === t.key ? 'bg-white text-[#0F1014]' : 'border border-white/15 text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <TalkCard key={item.id} item={item} onClick={() => onOpenItem(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-white/40">
      <Loader2 className="mb-3 h-7 w-7 animate-spin" />
      <p className="text-[13px]">Loading…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center text-white/40">
      <Frown className="mx-auto mb-2.5 h-7 w-7 opacity-60" />
      <p className="text-[13px]">{message}</p>
    </div>
  );
}

interface BottomNavProps {
  nav: NavTab;
  onNav: (t: NavTab) => void;
}

function BottomNav({ nav, onNav }: BottomNavProps) {
  const tabs: { key: NavTab; icon: React.ReactNode; label: string }[] = [
    { key: 'explore', icon: <Compass className="h-[22px] w-[22px]" />, label: 'Explore' },
    { key: 'browse', icon: <CalendarDays className="h-[22px] w-[22px]" />, label: 'Browse' },
    { key: 'spaces', icon: <Coffee className="h-[22px] w-[22px]" />, label: 'Spaces' },
    { key: 'collections', icon: <Bookmark className="h-[22px] w-[22px]" />, label: 'Collections' },
    {
      key: 'profile',
      icon: (
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#2a2a40] to-[#1a1a2e] border border-white/30 flex items-center justify-center text-[10px] font-bold text-white">
          U
        </div>
      ),
      label: 'Profile',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t border-white/[0.06] bg-[#0F1014] px-2 pb-[env(safe-area-inset-bottom)]"
      style={{ height: '64px' }}
    >
      {tabs.map((t) => {
        const active = nav === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onNav(t.key)}
            aria-label={t.label}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              active ? 'text-white' : 'text-white/35 hover:text-white/60'
            }`}
          >
            {t.icon}
          </button>
        );
      })}
    </nav>
  );
}
