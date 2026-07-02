import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Bookmark,
  Play,
  Heart,
  Loader2,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  SortDesc,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { getVerdict, verdictStyles, type VerdictKey } from '../data/catalog';
import type { Item } from '../data/catalog';
import { useDetailFull } from '../hooks/useDetailFull';
import { useUserData } from '../context/userDataContext';
import { fetchRatings, upsertRating, type Rating } from '../api/userData';

interface DetailModalProps {
  id: number;
  accent: string;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function DetailModal({ id, accent, onClose, onToast }: DetailModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, loading, error } = useDetailFull(id);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [id]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end overflow-y-auto lg:items-center lg:justify-center">
      <div
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={scrollRef}
        className="relative w-full max-w-[520px] animate-slide-up overflow-y-auto rounded-t-[28px] border-t border-white/[0.08] bg-[#0d0709] thin-scrollbar lg:max-h-[92vh] lg:rounded-[24px] lg:border"
      >
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.09] bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-white/[0.1]"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {loading ? (
          <div className="flex h-[70vh] items-center justify-center text-white/40">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : error || !data ? (
          <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-white/40">
            <p className="text-[13px]">{error ?? 'Item not found'}</p>
          </div>
        ) : (
          <DetailBody data={data} accent={accent} onToast={onToast} />
        )}
      </div>
    </div>
  );
}

// ── Verdict / Tier system ────────────────────────────────────────────────────

interface Tier {
  key: VerdictKey;
  label: string;
  score: number;
  color: string;
  textColor: string;
  bgClass: string;
}

const TIERS: Tier[] = [
  { key: 'perfection', label: 'Perfection', score: 5, color: '#8B5CF6', textColor: '#fff', bgClass: 'bg-violet-500' },
  { key: 'goforit',    label: 'Go for it',  score: 4, color: '#10B981', textColor: '#fff', bgClass: 'bg-emerald-500' },
  { key: 'timepass',  label: 'Timepass',   score: 3, color: '#F59E0B', textColor: '#000', bgClass: 'bg-amber-400' },
  { key: 'skip',      label: 'Skip',       score: 1, color: '#EF4444', textColor: '#fff', bgClass: 'bg-rose-500' },
];

function scoreToTier(score: number): Tier {
  if (score >= 5) return TIERS[0];
  if (score >= 4) return TIERS[1];
  if (score >= 3) return TIERS[2];
  return TIERS[3];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  '#B8860B', '#D64550', '#0EA5E9', '#9370DB', '#10B981',
  '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Genre Vibe chart colors ─────────────────────────────────────────────────

const GENRE_COLORS = ['#B8860B', '#D64550', '#0EA5E9', '#9370DB', '#10B981', '#F59E0B'];

function genreWeights(genres: { id: number; name: string }[]): { name: string; weight: number; color: string }[] {
  if (genres.length === 0) return [];
  const weights = genres.map((_, i) => {
    if (i === 0) return 0.40;
    if (i === 1) return 0.28;
    if (i === 2) return 0.18;
    if (i === 3) return 0.09;
    return 0.05;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  return genres.slice(0, 5).map((g, i) => ({
    name: g.name,
    weight: Math.round((weights[i] / total) * 100),
    color: GENRE_COLORS[i % GENRE_COLORS.length],
  }));
}

// ── Donut SVG chart ──────────────────────────────────────────────────────────

function DonutChart({ slices }: { slices: { name: string; weight: number; color: string }[] }) {
  const R = 38;
  const CX = 60;
  const CY = 60;
  const SW = 16;
  const C = 2 * Math.PI * R;

  let offset = 0;
  const segments = slices.map((s) => {
    const dash = (s.weight / 100) * C;
    const gap = C - dash;
    const seg = { ...s, dash, gap, offset };
    offset += dash;
    return seg;
  });

  const dominant = slices[0];

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={SW}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset + C / 4}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          ))}
        </svg>
        {dominant && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold leading-tight text-white/90">{dominant.name}</span>
            <span className="text-[15px] font-extrabold leading-none" style={{ color: dominant.color }}>
              {dominant.weight}%
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {slices.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-[12px] text-white/70">
              {s.name} <span className="text-white/40">({s.weight}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Rating meter ─────────────────────────────────────────────────────────────

function RatingMeter({ reviews }: { reviews: Rating[] }) {
  const counts = useMemo(() => {
    const map: Record<VerdictKey, number> = { perfection: 0, goforit: 0, timepass: 0, skip: 0 };
    reviews.forEach((r) => { map[scoreToTier(r.score).key]++; });
    return map;
  }, [reviews]);

  const total = reviews.length;
  const tiers = TIERS.map((t) => ({ ...t, count: counts[t.key], pct: total ? Math.round((counts[t.key] / total) * 100) : 0 }));
  const topTier = tiers.reduce((a, b) => (a.count >= b.count ? a : b));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Rating Meter</h3>
        <span className="text-[11px] text-white/40">{total} votes</span>
      </div>

      {total === 0 ? (
        <p className="text-[12px] text-white/35">No ratings yet — be the first to rate.</p>
      ) : (
        <>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-full" style={{ height: 10, background: 'rgba(255,255,255,0.07)' }}>
              <div className="flex h-full">
                {tiers.map((t) =>
                  t.pct > 0 ? (
                    <div
                      key={t.key}
                      style={{ width: `${t.pct}%`, background: t.color, transition: 'width 0.5s ease' }}
                    />
                  ) : null,
                )}
              </div>
            </div>
            <span
              className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
              style={{ background: topTier.color, color: topTier.textColor }}
            >
              {topTier.label}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {tiers.map((t) => (
              <div key={t.key} className="flex items-center gap-2">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: t.color }} />
                <span className="text-[11px] text-white/55">{t.label}</span>
                <span className="ml-auto text-[11px] font-semibold text-white/70">{t.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-t border-white/[0.07]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Cast card ─────────────────────────────────────────────────────────────────

function CastCard({ name, character, photoUrl }: { name: string; character: string; photoUrl: string | null }) {
  return (
    <div className="flex-shrink-0 w-[80px] flex flex-col items-center gap-1.5">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="h-16 w-16 rounded-full object-cover border border-white/[0.09]"
        />
      ) : (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.09] text-[13px] font-bold text-white"
          style={{ background: avatarColor(name) + '33', borderColor: avatarColor(name) + '44' }}
        >
          {initials(name)}
        </div>
      )}
      <p className="w-full text-center text-[10px] font-semibold leading-tight text-white/85 line-clamp-2">{name}</p>
      <p className="w-full text-center text-[9px] leading-tight text-white/40 line-clamp-2">{character}</p>
    </div>
  );
}

// ── Crew person ───────────────────────────────────────────────────────────────

function CrewPerson({ name, role }: { name: string; role: string }) {
  const color = avatarColor(name);
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: color + '28', border: `1.5px solid ${color}44` }}
      >
        {initials(name)}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-white/90">{name}</p>
        <p className="text-[11px] text-white/45">{role}</p>
      </div>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Rating }) {
  const tier = scoreToTier(review.score);
  const color = avatarColor(review.author);
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5">
      <div className="mb-2 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: color + '33', border: `1.5px solid ${color}44` }}
        >
          {initials(review.author)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-white/85 truncate">@{review.author}</p>
          <p className="text-[10px] text-white/35">{timeAgo(review.createdAt)}</p>
        </div>
        <span
          className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
          style={{ background: tier.color + '22', color: tier.color, border: `1px solid ${tier.color}44` }}
        >
          {tier.label}
        </span>
      </div>
      {review.review && (
        <p className="mb-2.5 text-[12px] leading-relaxed text-white/60">{review.review}</p>
      )}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-rose-400 transition-colors">
          <Heart className="h-3.5 w-3.5" />
          <span>0</span>
        </button>
        <button className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/60 transition-colors">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Reply</span>
        </button>
      </div>
    </div>
  );
}

// ── Tier picker ───────────────────────────────────────────────────────────────

function TierPicker({ value, onChange }: { value: VerdictKey; onChange: (v: VerdictKey) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {TIERS.map((t) => {
        const selected = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className="rounded-xl py-2 text-[11px] font-bold transition-all"
            style={{
              background: selected ? t.color : t.color + '18',
              color: selected ? t.textColor : t.color,
              border: `1px solid ${t.color}${selected ? 'ff' : '44'}`,
              transform: selected ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Trailer modal ─────────────────────────────────────────────────────────────

function TrailerModal({ trailerKey, onClose }: { trailerKey: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-[560px]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="h-full w-full"
            title="Trailer"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main body ─────────────────────────────────────────────────────────────────

type DetailBodyData = ReturnType<typeof useDetailFull>['data'];

function DetailBody({ data, accent, onToast }: { data: NonNullable<DetailBodyData>; accent: string; onToast: (msg: string) => void }) {
  const { user, displayName, isSaved, isFavorite, toggleWatchlist, toggleFavorite, configured, recordContinue } = useUserData();

  const item: Item = data.kind === 'tmdb' ? data.item : data.item;
  const saved = isSaved(item.id);
  const watched = isFavorite(item.id);

  const trailerKey = data.kind === 'tmdb' ? data.trailerKey : null;
  const genres = data.kind === 'tmdb' ? data.genres : [];
  const cast = data.kind === 'tmdb' ? data.cast : [];
  const director = data.kind === 'tmdb' ? data.director : null;
  const writers = data.kind === 'tmdb' ? data.writers : [];
  const ageRating = data.kind === 'tmdb' ? data.ageRating : null;
  const country = data.kind === 'tmdb' ? data.country : null;
  const language = data.kind === 'tmdb' ? data.language : null;
  const productionCompanies = data.kind === 'tmdb' ? data.productionCompanies : [];
  const runtime = data.kind === 'tmdb' ? data.runtime : null;
  const year = data.kind === 'tmdb' ? data.year : item.subtitle.split(' • ')[0] ?? '—';

  const [showTrailer, setShowTrailer] = useState(false);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tierKey, setTierKey] = useState<VerdictKey>('goforit');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!configured) return;
    try {
      const d = await fetchRatings(item.id);
      setReviews(d);
    } catch {
      // silent
    }
  }, [configured, item.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);
  useEffect(() => { if (user) recordContinue(item).catch(() => undefined); }, [user, item, recordContinue]);

  const myReview = useMemo(() => reviews.find((r) => r.userId === user?.id) ?? null, [reviews, user]);
  useEffect(() => {
    if (myReview) {
      setTierKey(scoreToTier(myReview.score).key);
      setText(myReview.review);
    }
  }, [myReview]);

  const handleWatched = async () => {
    if (!user) { onToast('Sign in to mark as watched'); return; }
    try {
      const added = await toggleFavorite(item);
      onToast(added ? 'Marked as watched ✓' : 'Removed from watched');
    } catch { onToast('Something went wrong'); }
  };

  const handleWatchlist = async () => {
    if (!user) { onToast('Sign in to use your watchlist'); return; }
    try {
      const added = await toggleWatchlist(item);
      onToast(added ? 'Added to watchlist' : 'Removed from watchlist');
    } catch { onToast('Something went wrong'); }
  };

  const handleReviewClick = () => {
    if (!user) { onToast('Sign in to write a review'); return; }
    setShowForm((v) => !v);
  };

  const submitReview = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const score = TIERS.find((t) => t.key === tierKey)?.score ?? 4;
      await upsertRating({ userId: user.id, author: displayName, item, score, review: text.trim() });
      onToast('Review saved');
      setShowForm(false);
      await loadReviews();
    } catch { onToast('Failed to save review'); } finally { setSubmitting(false); }
  };

  const vibeSlices = useMemo(() => genreWeights(genres), [genres]);
  const heroImage = item.backdrop ?? item.image;
  const mediaTypeLabel = item.mediaType === 'movie' ? 'Movie' : item.mediaType === 'tv' ? 'TV Show' : 'Anime';

  return (
    <>
      {showTrailer && trailerKey && (
        <TrailerModal trailerKey={trailerKey} onClose={() => setShowTrailer(false)} />
      )}

      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: 240 }}>
        {heroImage ? (
          <img src={heroImage} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${accent}33, #0d0709)` }}>
            {item.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0709] via-[#0d0709]/20 to-transparent" />
        {trailerKey && (
          <button
            onClick={() => setShowTrailer(true)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-all hover:scale-110"
            aria-label="Play trailer"
          >
            <Play className="h-6 w-6 fill-white text-white ml-0.5" />
          </button>
        )}
      </div>

      {/* ── Title block ── */}
      <div className="px-5 pt-2 pb-4">
        <div className="flex gap-3 items-start">
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="h-[88px] w-[60px] flex-shrink-0 rounded-xl object-cover border border-white/[0.09] -mt-10 relative z-10 shadow-2xl"
            />
          )}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="font-display text-[18px] font-extrabold leading-tight text-white">{item.name}</h1>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-white/45 rounded-full border border-white/[0.09] px-2 py-0.5">{mediaTypeLabel}</span>
              <span className="text-[11px] text-white/45">{year}</span>
              {runtime && <span className="text-[11px] text-white/45">• {runtime}</span>}
              {item.mediaType === 'tv' && !runtime && (
                <span className="text-[11px] text-white/45">• {item.metrics.find((m) => m.label === 'Seasons')?.value ?? ''} seasons</span>
              )}
            </div>
          </div>
        </div>

        {/* Metadata row */}
        <div className="mt-3 flex flex-wrap gap-2">
          {director && (
            <MetaChip label="Director" value={director} />
          )}
          {country && <MetaChip label="Country" value={country} />}
          {language && <MetaChip label="Language" value={language} />}
          {ageRating && <MetaChip label="Age Rating" value={ageRating} accent />}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="px-5 pb-5 grid grid-cols-2 gap-2.5">
        <button
          onClick={handleWatched}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-bold transition-all ${
            watched
              ? 'bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)]'
              : 'bg-white text-[#0d0709] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.2)]'
          }`}
        >
          <CheckCircle2 className={`h-4 w-4 ${watched ? 'fill-white/30' : ''}`} />
          {watched ? 'Watched' : 'Mark as Watched'}
        </button>
        <button
          onClick={handleWatchlist}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-bold transition-all border ${
            saved
              ? 'border-gold/60 bg-gold/15 text-gold-light'
              : 'border-white/[0.1] bg-white/[0.06] text-white hover:bg-white/[0.09]'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          {saved ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
      </div>

      {/* ── Overview ── */}
      <div className="px-5 pb-4 border-t border-white/[0.07] pt-4">
        <h3 className="mb-2.5 text-sm font-bold text-white">Overview</h3>
        <p className="text-[13px] leading-relaxed text-white/60">
          {item.overview || 'No description available.'}
        </p>
        {genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {genres.map((g) => (
              <span
                key={g.id}
                className="rounded-full border border-white/[0.1] bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-white/60"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Vibe Chart ── */}
      {vibeSlices.length > 0 && (
        <Section title="Vibe Chart">
          <DonutChart slices={vibeSlices} />
        </Section>
      )}

      {/* ── Cast ── */}
      {cast.length > 0 && (
        <Section title="Cast" action={<ChevronRight className="h-4 w-4 text-white/30" />}>
          <div className="flex gap-3 overflow-x-auto pb-2 thin-scrollbar -mx-1 px-1">
            {cast.map((c) => (
              <CastCard key={c.id} name={c.name} character={c.character} photoUrl={c.profileUrl} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Crew ── */}
      {(director || writers.length > 0) && (
        <Section title="Crew">
          <div className="flex flex-col gap-3">
            {director && <CrewPerson name={director} role="Director" />}
            {writers.map((w) => (
              <CrewPerson key={w.id} name={w.name} role={w.job} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Production House ── */}
      {productionCompanies.length > 0 && (
        <Section title="Production House">
          <div className="flex flex-wrap gap-2">
            {productionCompanies.map((p) => (
              <span
                key={p.id}
                className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-[12px] text-white/65"
              >
                {p.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Watch Online ── */}
      <Section title="Watch Online">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 text-center">
          <p className="text-[12px] text-white/35">Streaming info coming soon.</p>
          <p className="mt-1 text-[11px] text-white/25">We're adding platform links manually.</p>
          <button className="mt-2 text-[11px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-1 mx-auto">
            <ExternalLink className="h-3 w-3" />
            Know where to watch? Let us know
          </button>
        </div>
      </Section>

      {/* ── Rating Meter ── */}
      <Section title="Rating Meter">
        <RatingMeter reviews={reviews} />
      </Section>

      {/* ── Reviews ── */}
      <div className="px-5 py-4 border-t border-white/[0.07]">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-sm font-bold text-white flex-1">Reviews</h3>
          <button
            className="flex items-center gap-1 rounded-full border border-white/[0.09] bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/45 hover:bg-white/[0.07] transition-all"
            onClick={() => setShowSpoilers((v) => !v)}
          >
            {showSpoilers ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {showSpoilers ? 'Spoilers On' : 'Hide Spoilers'}
          </button>
          <button className="flex items-center gap-1 rounded-full border border-white/[0.09] bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/45 hover:bg-white/[0.07] transition-all">
            <SortDesc className="h-3 w-3" />
            Most Liked
          </button>
        </div>

        {/* Review form */}
        {showForm && (
          <div className="mb-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 animate-fade-in">
            <p className="mb-2.5 text-[12px] font-semibold text-white/60">Your verdict</p>
            <TierPicker value={tierKey} onChange={setTierKey} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts... (optional)"
              rows={3}
              className="mt-3 w-full resize-none rounded-xl border border-white/[0.09] bg-white/[0.04] p-3 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-white/20 transition-colors"
            />
            <div className="mt-2.5 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-white/[0.09] bg-white/[0.04] px-3.5 py-2 text-[11px] font-semibold text-white/60 hover:bg-white/[0.07] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submitting}
                className="rounded-xl bg-white px-4 py-2 text-[11px] font-bold text-[#0d0709] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving…' : myReview ? 'Update review' : 'Post review'}
              </button>
            </div>
          </div>
        )}

        {/* Write review CTA */}
        {!showForm && (
          <button
            onClick={handleReviewClick}
            className="mb-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-[12px] text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-all"
          >
            {myReview ? 'Edit your review…' : 'Write a review…'}
          </button>
        )}

        {/* Review list */}
        <div className="flex flex-col gap-2.5">
          {reviews.length === 0 ? (
            <p className="text-center py-4 text-[12px] text-white/30">
              {configured ? 'No reviews yet.' : 'Sign in to see community reviews.'}
            </p>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>

        <div className="h-6" />
      </div>
    </>
  );
}

// ── Meta chip ─────────────────────────────────────────────────────────────────

function MetaChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 min-w-[70px]">
      <span className="text-[9px] uppercase tracking-widest text-white/35 mb-0.5">{label}</span>
      <span
        className={`text-[12px] font-semibold leading-tight ${accent ? 'text-amber-400' : 'text-white/80'}`}
      >
        {value}
      </span>
    </div>
  );
}
