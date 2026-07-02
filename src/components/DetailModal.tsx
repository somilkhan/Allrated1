import { useEffect, useRef } from 'react';
import { X, Bookmark, PenLine } from 'lucide-react';
import {
  getMetrics,
  getVerdict,
  starsFor,
  verdictStyles,
} from '../data/catalog';
import type { CategoryKey, Item } from '../data/catalog';

interface DetailModalProps {
  item: Item;
  cat: CategoryKey;
  accent: string;
  saved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
  onReview: () => void;
}

export function DetailModal({
  item,
  cat,
  accent,
  saved,
  onClose,
  onToggleSave,
  onReview,
}: DetailModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [item.id]);

  const verdict = getVerdict(item.rating);
  const metrics = getMetrics(item, cat);

  return (
    <div className="fixed inset-0 z-[200] flex items-end overflow-y-auto lg:items-center lg:justify-center">
      <div
        className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={scrollRef}
        className="relative w-full max-w-[500px] animate-slide-up overflow-y-auto rounded-t-[28px] border-t border-white/[0.09] bg-ink-900 thin-scrollbar lg:max-h-[88vh] lg:rounded-[28px] lg:border"
      >
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.045] text-white transition-all hover:bg-white/[0.08] hover:border-white/20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="flex aspect-square w-full items-center justify-center text-[80px]"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${accent}40, transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
          }}
        >
          {item.emoji}
        </div>

        <div className="p-6">
          <h1 className="font-display text-2xl font-extrabold leading-tight">{item.name}</h1>
          <p className="mb-3.5 text-[13px] text-white/55">{item.subtitle}</p>

          <div className="mb-5 flex items-center gap-2.5">
            <span className="tracking-[1px] text-gold-light">{starsFor(item.rating)}</span>
            <span className="text-sm text-white/70">
              {item.rating}/5 • {item.reviews} reviews
            </span>
            <span
              className={`ml-auto rounded-full px-3 py-1 text-[11px] font-bold ${verdictStyles[verdict.key]}`}
            >
              {verdict.label}
            </span>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2.5">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-white/[0.09] bg-white/[0.045] p-3 text-center"
              >
                <div className="mb-1.5 text-[10px] uppercase tracking-wide text-white/55">
                  {m.label}
                </div>
                <div className="text-lg font-extrabold">{m.value}</div>
              </div>
            ))}
          </div>

          <div className="mb-5">
            <h3 className="mb-2.5 text-sm font-bold">About</h3>
            <p className="text-[13px] leading-relaxed text-white/55">
              Discover why users love this {cat} item. Read real reviews from the community.
            </p>
          </div>

          <div className="mb-5">
            <h3 className="mb-2.5 text-sm font-bold">Reviews</h3>
            <div className="flex flex-col gap-2.5">
              <Review user="@reviewer_1" time="2 days ago" text="Amazing product! Highly recommended. Perfect for everything." />
              <Review user="@user_2024" time="1 week ago" text="Great quality at this price point. Will definitely buy again!" />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2.5">
            <button
              onClick={onToggleSave}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-[13px] font-bold transition-all ${
                saved
                  ? 'border border-gold bg-gold/15 text-gold-light'
                  : 'border border-white/[0.09] bg-white/[0.045] text-white hover:bg-white/[0.08]'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={onReview}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-white to-[#e8e8e8] py-3 text-[13px] font-bold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.2)]"
            >
              <PenLine className="h-4 w-4" />
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Review({ user, time, text }: { user: string; time: string; text: string }) {
  return (
    <div className="rounded-[10px] border border-white/[0.09] bg-white/[0.045] p-3">
      <div className="mb-1 text-xs font-semibold">
        {user} • {time}
      </div>
      <div className="text-xs leading-relaxed text-white/55">{text}</div>
    </div>
  );
}
