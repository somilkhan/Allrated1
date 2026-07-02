import { getVerdict, starsFor, verdictStyles } from '../data/catalog';
import type { Item } from '../data/catalog';

interface CardProps {
  item: Item;
  accent: string;
  minWidth?: string;
  onClick: () => void;
}

export function Card({ item, accent, minWidth, onClick }: CardProps) {
  const verdict = getVerdict(item.rating);
  return (
    <button
      onClick={onClick}
      style={minWidth ? { minWidth } : undefined}
      className="group overflow-hidden rounded-[14px] border border-white/[0.09] bg-ink-600/60 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
    >
      <div className="relative aspect-[2/3] w-full">
        <div
          className="absolute inset-0 flex items-center justify-center text-4xl"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${accent}40, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
          }}
        >
          {item.emoji}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 to-transparent" />
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide backdrop-blur-md ${verdictStyles[verdict.key]}`}
        >
          {verdict.label}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <div className="mb-1 text-[13px] font-bold leading-tight text-white">{item.name}</div>
          <div className="mb-1.5 text-[11px] text-white/65">{item.subtitle}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white">
            <span className="tracking-[1px] text-gold-light">{starsFor(item.rating)}</span>
            <span>{item.rating}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

interface FeaturedCardProps {
  item: Item;
  accent: string;
  onClick: () => void;
}

export function FeaturedCard({ item, accent, onClick }: FeaturedCardProps) {
  const verdict = getVerdict(item.rating);
  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[20px] border border-white/[0.09] bg-ink-600/60 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-stretch"
    >
      <div
        className="flex aspect-video items-center justify-center text-6xl lg:aspect-auto lg:h-full"
        style={{
          background: `radial-gradient(circle at 25% 30%, ${accent}50, transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
        }}
      >
        {item.emoji}
      </div>
      <div className="p-4">
        <div className="mb-1.5 text-base font-bold">{item.name}</div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="tracking-[1px] text-gold-light">{starsFor(item.rating)}</span>
          <span className="text-white/70">
            {item.rating} • {item.reviews} reviews
          </span>
          <span
            className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${verdictStyles[verdict.key]}`}
          >
            {verdict.label}
          </span>
        </div>
      </div>
    </button>
  );
}

interface RankCardProps {
  item: Item;
  rank: number | null;
  onClick: () => void;
}

export function RankCard({ item, rank, onClick }: RankCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.09] bg-ink-600/60 p-3 text-left transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
    >
      <div className="min-w-[30px] text-base font-extrabold text-white/55">
        {rank !== null ? `#${rank}` : ''}
      </div>
      <div className="flex-1">
        <div className="mb-0.5 text-[13px] font-semibold">{item.name}</div>
        <div className="text-[11px] text-white/55">{item.subtitle}</div>
      </div>
      <div className="text-[11px] tracking-[1px] text-gold-light">{starsFor(item.rating)}</div>
    </button>
  );
}
