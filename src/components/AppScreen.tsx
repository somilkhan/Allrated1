import { useState } from 'react';
import {
  Bell,
  Bookmark,
  ChevronLeft,
  Home,
  Plus,
  Search,
  Star,
  User,
  Sparkles,
  TrendingUp,
  Flame,
  Trophy,
  Compass,
  Layers,
  Frown,
} from 'lucide-react';
import { categoryData } from '../data/catalog';
import type { CategoryKey, Item } from '../data/catalog';
import { Card, FeaturedCard, RankCard } from './Cards';

interface AppScreenProps {
  cat: CategoryKey;
  user: string;
  savedCount: number;
  onBackToCategories: () => void;
  onOpenItem: (item: Item) => void;
  onOpenSaved: () => void;
  onToast: (msg: string) => void;
}

type NavPage = 'home' | 'search' | 'add' | 'save' | 'profile';

export function AppScreen({
  cat,
  user,
  savedCount,
  onBackToCategories,
  onOpenItem,
  onOpenSaved,
  onToast,
}: AppScreenProps) {
  const meta = categoryData[cat];
  const accent = meta.accent;
  const [query, setQuery] = useState('');
  const [nav, setNav] = useState<NavPage>('home');

  const items = meta.items;
  const searching = query.trim().length > 0;
  const filtered = searching
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(query.trim().toLowerCase()) ||
          i.subtitle.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : [];

  const topRated = [...items].sort((a, b) => b.rating - a.rating);
  const collections = [
    { name: 'My Favorites', count: 12 },
    { name: 'Summer Vibes', count: 8 },
    { name: 'Best Value', count: 15 },
    { name: 'New Releases', count: 6 },
  ];

  const handleNav = (page: NavPage) => {
    setNav(page);
    if (page === 'home') {
      setQuery('');
      const feed = document.getElementById('mainFeed');
      feed?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'search') {
      const el = document.getElementById('searchInput');
      el?.focus();
    } else if (page === 'add') {
      onToast('Write review — coming soon');
    } else if (page === 'save') {
      onOpenSaved();
    } else if (page === 'profile') {
      onToast(`Profile: ${user}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto pb-[100px] animate-fade-in lg:pb-[140px]">
      <Header
        cat={cat}
        accent={accent}
        savedCount={savedCount}
        onBackToCategories={onBackToCategories}
        onOpenSaved={onOpenSaved}
        onToast={onToast}
        user={user}
      />

      <Hero
        accent={accent}
        query={query}
        onQuery={setQuery}
      />

      <div id="mainFeed" className="mx-auto w-full max-w-[1100px] flex-1 px-4 lg:px-8">
        {searching ? (
          <SearchResults
            query={query}
            filtered={filtered}
            accent={accent}
            onOpenItem={onOpenItem}
          />
        ) : (
          <div>
            <Section title="Talk of the town" icon={<Flame className="h-3.5 w-3.5" style={{ color: accent }} />}>
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
                {items.slice(0, 3).map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    accent={accent}
                    minWidth="140px"
                    onClick={() => onOpenItem(item)}
                  />
                ))}
              </div>
            </Section>

            <Section title="Trending now" icon={<TrendingUp className="h-3.5 w-3.5" style={{ color: accent }} />}>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {items.slice(0, 4).map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    accent={accent}
                    onClick={() => onOpenItem(item)}
                  />
                ))}
              </div>
            </Section>

            <Section title="Featured" icon={<Sparkles className="h-3.5 w-3.5" style={{ color: accent }} />}>
              <FeaturedCard item={items[0]} accent={accent} onClick={() => onOpenItem(items[0])} />
            </Section>

            <Section title="Collections" icon={<Layers className="h-3.5 w-3.5" style={{ color: accent }} />}>
              <div className="flex flex-col gap-2.5">
                {collections.map((col) => (
                  <button
                    key={col.name}
                    className="flex items-center justify-between rounded-[14px] border border-white/[0.09] bg-ink-600/60 p-3.5 text-left transition-all duration-300 hover:translate-x-1 hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    <div>
                      <div className="text-[13px] font-semibold">{col.name}</div>
                      <div className="mt-0.5 text-[11px] text-white/55">{col.count} items</div>
                    </div>
                    <span className="text-base text-white/55">→</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Top rated" icon={<Trophy className="h-3.5 w-3.5" style={{ color: accent }} />}>
              <div className="flex flex-col gap-2">
                {topRated.map((item, idx) => (
                  <RankCard
                    key={item.id}
                    item={item}
                    rank={idx + 1}
                    onClick={() => onOpenItem(item)}
                  />
                ))}
              </div>
            </Section>

            <Section title="Explore" icon={<Compass className="h-3.5 w-3.5" style={{ color: accent }} />}>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    accent={accent}
                    onClick={() => onOpenItem(item)}
                  />
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>

      <BottomNav nav={nav} onNav={handleNav} accent={accent} accentLight={meta.accentLight} savedCount={savedCount} />
    </div>
  );
}

interface HeaderProps {
  cat: CategoryKey;
  accent: string;
  savedCount: number;
  onBackToCategories: () => void;
  onOpenSaved: () => void;
  onToast: (msg: string) => void;
  user: string;
}

function Header({ cat, accent, savedCount, onBackToCategories, onOpenSaved, onToast, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.09] bg-ink-900/80 px-4 py-3.5 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onBackToCategories}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.045] text-white transition-all hover:border-white/20 hover:bg-white/[0.08] lg:hidden"
          aria-label="Back to categories"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onBackToCategories}
          className="hidden items-center gap-1.5 py-1.5 pr-2 lg:flex"
        >
          <Star className="h-4 w-4" style={{ color: accent }} />
          <span className="font-display text-[15px] font-black uppercase tracking-wider">AllRated</span>
        </button>
        <span className="rounded-full border border-white/[0.09] bg-white/[0.045] px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white/55">
          {categoryData[cat].label}
        </span>
      </div>
      <div className="flex gap-3">
        <IconButton onClick={() => onToast('No new notifications')} ariaLabel="Notifications">
          <Bell className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={onOpenSaved} ariaLabel="Saved">
          <Bookmark className="h-4 w-4" />
          {savedCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {savedCount}
            </span>
          )}
        </IconButton>
        <IconButton onClick={() => onToast(`Signed in as ${user}`)} ariaLabel="Profile">
          <User className="h-4 w-4" />
        </IconButton>
      </div>
    </header>
  );
}

function IconButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.045] text-white transition-all hover:border-white/20 hover:bg-white/[0.08]"
    >
      {children}
    </button>
  );
}

interface HeroProps {
  accent: string;
  query: string;
  onQuery: (v: string) => void;
}

function Hero({ accent, query, onQuery }: HeroProps) {
  return (
    <div
      className="mx-auto w-full max-w-[1100px] px-4 pb-5 pt-7 lg:px-8 lg:pt-10"
      style={{
        background: `radial-gradient(ellipse 70% 55% at 25% 0%, ${accent}40, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 10%, ${accent}30, transparent 70%)`,
      }}
    >
      <h1 className="mb-4 font-display text-[30px] font-black tracking-tight lg:text-[42px]">
        Rate. Review. Discover.
      </h1>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/55" />
        <input
          id="searchInput"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search items, brands, genres..."
          className="w-full rounded-[14px] border border-white/[0.09] bg-white/[0.045] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/55 focus:border-white/20 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        />
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3.5 flex items-center gap-2 text-base font-bold lg:text-[16px]">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

interface SearchResultsProps {
  query: string;
  filtered: Item[];
  accent: string;
  onOpenItem: (item: Item) => void;
}

function SearchResults({ query, filtered, accent, onOpenItem }: SearchResultsProps) {
  if (filtered.length === 0) {
    return (
      <div className="py-10 text-center text-white/55">
        <Frown className="mx-auto mb-2.5 h-7 w-7 opacity-60" />
        <p className="text-[13px]">No results for "{query.trim()}"</p>
      </div>
    );
  }
  return (
    <section className="mb-8">
      <h2 className="mb-3.5 text-base font-bold">Results for "{query.trim()}"</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {filtered.map((item) => (
          <Card
            key={item.id}
            item={item}
            accent={accent}
            onClick={() => onOpenItem(item)}
          />
        ))}
      </div>
    </section>
  );
}

interface BottomNavProps {
  nav: NavPage;
  onNav: (p: NavPage) => void;
  accent: string;
  accentLight: string;
  savedCount: number;
}

function BottomNav({ nav, onNav, accent, accentLight, savedCount }: BottomNavProps) {
  const items: { key: NavPage; icon: React.ReactNode; label: string }[] = [
    { key: 'home', icon: <Home className="h-[18px] w-[18px]" />, label: 'Home' },
    { key: 'search', icon: <Search className="h-[18px] w-[18px]" />, label: 'Search' },
    { key: 'add', icon: <Plus className="h-4 w-4" />, label: 'Add' },
    { key: 'save', icon: <Bookmark className="h-[18px] w-[18px]" />, label: 'Saved' },
    { key: 'profile', icon: <User className="h-[18px] w-[18px]" />, label: 'Profile' },
  ];

  return (
    <nav
      className="fixed bottom-[18px] left-1/2 z-[100] flex h-[66px] w-[calc(100%-32px)] max-w-[380px] -translate-x-1/2 items-center justify-around gap-1 rounded-full border border-white/[0.09] bg-ink-700/90 px-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:max-w-[420px]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((it) => {
        const isAdd = it.key === 'add';
        if (isAdd) {
          return (
            <button
              key={it.key}
              onClick={() => onNav(it.key)}
              aria-label={it.label}
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full text-white shadow-[0_6px_18px_rgba(184,134,11,0.35)] transition-all hover:scale-110 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)` }}
            >
              {it.icon}
            </button>
          );
        }
        const active = nav === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onNav(it.key)}
            aria-label={it.label}
            className={`relative flex h-[42px] w-[42px] items-center justify-center rounded-full transition-all ${
              active
                ? 'bg-white text-ink-900'
                : 'text-white/55 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {it.icon}
            {it.key === 'save' && savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
