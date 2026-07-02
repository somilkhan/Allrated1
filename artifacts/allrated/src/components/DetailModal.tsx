import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Bookmark, PenLine, Heart, Loader2, Star } from 'lucide-react';
import {
  getMetrics,
  getVerdict,
  starsFor,
  verdictStyles,
  type VerdictKey,
} from '../data/catalog';
import type { Item } from '../data/catalog';
import { useDetails } from '../hooks/useDetails';
import { useUserData } from '../context/userDataContext';
import {
  fetchRatings,
  fetchTierVotes,
  upsertRating,
  upsertTierVote,
  type Rating,
  type TierKey,
  type TierVoteCounts,
} from '../api/userData';
import { fetchTmdbCredits, type CrewMember, type CastMember } from '../api/tmdb';
import { getMockReviews } from '../data/mockReviews';
import { decodeId } from '../api/ids';

interface DetailModalProps {
  id: number;
  accent: string;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function DetailModal({ id, accent, onClose, onToast }: DetailModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { item, loading, error } = useDetails(id);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [id]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end lg:items-center lg:justify-center">
      <div
        className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={scrollRef}
        className="relative w-full max-w-[500px] animate-slide-up overflow-y-auto rounded-t-[28px] border-t border-white/[0.09] bg-ink-900 thin-scrollbar max-h-[92vh] lg:max-h-[88vh] lg:rounded-[28px] lg:border"
      >
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.045] text-white transition-all hover:bg-white/[0.08] hover:border-white/20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="flex h-[60vh] items-center justify-center text-white/55">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : error || !item ? (
          <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-white/55">
            <p className="text-[13px]">{error ?? 'Item not found'}</p>
          </div>
        ) : (
          <DetailBody item={item} accent={accent} onToast={onToast} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tier config
// ---------------------------------------------------------------------------

const TIERS: { key: TierKey; label: string; color: string; bar: string; badge: string }[] = [
  {
    key: 'skip',
    label: 'Skip',
    color: 'border-rose-500/60 bg-rose-500/20 text-rose-300',
    bar: 'bg-rose-500',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
  },
  {
    key: 'timepass',
    label: 'Timepass',
    color: 'border-amber-500/60 bg-amber-500/20 text-amber-300',
    bar: 'bg-amber-500',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  },
  {
    key: 'goforit',
    label: 'Go for it',
    color: 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  },
  {
    key: 'perfection',
    label: 'Perfection',
    color: 'border-violet-500/60 bg-violet-500/20 text-violet-300',
    bar: 'bg-violet-500',
    badge: 'bg-violet-500/20 text-violet-300 border border-violet-500/40',
  },
];

function tierConfig(key: TierKey) {
  return TIERS.find((t) => t.key === key)!;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 3)
    .join('');
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CrewSection({ crew }: { crew: CrewMember[] }) {
  if (crew.length === 0) return null;
  return (
    <div className="mb-5">
      <h3 className="mb-2.5 text-sm font-bold">Crew</h3>
      <div className="flex flex-wrap gap-3">
        {crew.map((member) => (
          <div key={member.id} className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.07] text-[11px] font-bold tracking-wide text-white/80">
              {getInitials(member.name)}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold leading-tight text-white/90 truncate max-w-[120px]">
                {member.name}
              </div>
              <div className="text-[10px] text-white/45 leading-tight">{member.job}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TierGauge({ counts }: { counts: TierVoteCounts | null }) {
  const hasVotes = counts != null && counts.total > 0;

  // Weighted score 0-100: perfection=100, goforit=70, timepass=35, skip=0
  const score = hasVotes
    ? Math.round(
        (counts.perfection * 100 + counts.goforit * 70 + counts.timepass * 35) /
          counts.total,
      )
    : 0;

  // SVG gauge — 270° arc, gap at bottom
  const R = 50, CX = 64, CY = 68;
  const circ = 2 * Math.PI * R;
  const arcLen = circ * 0.75;           // 270° of full circle
  const fillLen = hasVotes ? arcLen * (score / 100) : 0;
  const scoreColor =
    score >= 75 ? '#8b5cf6' : score >= 50 ? '#10b981' : score >= 25 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="mb-5">
      <h3 className="mb-3 text-sm font-bold">Rating Meter</h3>
      <div className="flex items-center gap-5">
        {/* Circular gauge */}
        <div className="relative shrink-0" style={{ width: 120, height: 110 }}>
          <svg
            viewBox="0 0 128 118"
            width="120"
            height="110"
            style={{ transform: 'rotate(-225deg)', overflow: 'visible' }}
          >
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke="rgba(255,255,255,0.08)" strokeWidth="10"
              strokeDasharray={`${arcLen} ${circ - arcLen}`}
              strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke={scoreColor} strokeWidth="10"
              strokeDasharray={`${fillLen} ${circ - fillLen}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.7s ease, stroke 0.5s ease' }} />
          </svg>
          {/* Centre label — counter-rotated so text reads upright */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-extrabold leading-none">
              {hasVotes ? `${score}%` : '—'}
            </span>
            {hasVotes && (
              <span className="text-[9px] text-white/40 mt-0.5">{counts.total} votes</span>
            )}
          </div>
        </div>

        {/* Tier breakdown */}
        <div className="flex-1 space-y-2">
          {TIERS.map(({ key, bar, label }) => {
            const count = counts?.[key] ?? 0;
            const pct = hasVotes ? Math.round((count / counts!.total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`h-2 w-2 shrink-0 rounded-full ${bar}`} />
                <span className="flex-1 text-[11px] text-white/60">{label}</span>
                {hasVotes && (
                  <span className="text-[11px] font-semibold text-white/50">{pct}%</span>
                )}
              </div>
            );
          })}
          {!hasVotes && (
            <p className="text-[11px] text-white/30">
              {counts ? 'No votes yet — be first!' : 'Connect Supabase to see votes.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CastSection({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;
  return (
    <div className="mb-5">
      <h3 className="mb-2.5 text-sm font-bold">Cast</h3>
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {cast.map((member) => (
          <div key={member.id} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
            {member.profileUrl ? (
              <img
                src={member.profileUrl}
                alt={member.name}
                className="h-14 w-14 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.07] text-[11px] font-bold text-white/60">
                {getInitials(member.name)}
              </div>
            )}
            <div className="w-full text-center">
              <div className="truncate text-[10px] font-semibold leading-tight text-white/80">
                {member.name}
              </div>
              <div className="truncate text-[9px] leading-tight text-white/40">
                {member.character}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TierPicker({
  value,
  onChange,
}: {
  value: TierKey | null;
  onChange: (t: TierKey) => void;
}) {
  return (
    <div className="mb-2.5">
      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-white/45">
        Your verdict <span className="text-rose-400">*</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TIERS.map(({ key, label, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
              value === key
                ? color
                : 'border-white/[0.09] bg-white/[0.03] text-white/50 hover:bg-white/[0.07]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: TierKey }) {
  const cfg = tierConfig(tier);
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`Rate ${n}`}
          className="p-0.5"
        >
          <Star
            className={`h-5 w-5 ${n <= value ? 'fill-gold-light text-gold-light' : 'text-white/30'}`}
          />
        </button>
      ))}
    </div>
  );
}

function Review({
  user,
  time,
  score,
  text,
  tier,
}: {
  user: string;
  time: string;
  score: number;
  text: string;
  tier: TierKey | null;
}) {
  return (
    <div className="rounded-[10px] border border-white/[0.09] bg-white/[0.045] p-3">
      <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        <span>{user}</span>
        {tier && <TierBadge tier={tier} />}
        <span className="text-gold-light">{starsFor(score)}</span>
        <span className="ml-auto text-white/40">{time}</span>
      </div>
      {text && <div className="text-xs leading-relaxed text-white/55">{text}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main body
// ---------------------------------------------------------------------------

interface DetailBodyProps {
  item: Item;
  accent: string;
  onToast: (msg: string) => void;
}

function DetailBody({ item, accent, onToast }: DetailBodyProps) {
  const {
    configured,
    user,
    displayName,
    isSaved,
    isFavorite,
    toggleWatchlist,
    toggleFavorite,
    recordContinue,
  } = useUserData();

  const saved = isSaved(item.id);
  const favorite = isFavorite(item.id);

  const [reviews, setReviews] = useState<Rating[]>([]);
  const [tierVotes, setTierVotes] = useState<TierVoteCounts | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [score, setScore] = useState(5);
  const [text, setText] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { mediaType, externalId } = decodeId(item.id);
  const verdict = getVerdict(item.rating);
  const metrics = getMetrics(item);
  const hero = item.backdrop ?? item.image;

  // Load reviews
  const loadReviews = useCallback(async () => {
    if (!configured) return;
    try {
      const data = await fetchRatings(item.id);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  }, [configured, item.id]);

  // Load tier votes
  const loadTierVotes = useCallback(async () => {
    if (!configured) return;
    try {
      const data = await fetchTierVotes(item.id, user?.id);
      setTierVotes(data);
    } catch (err) {
      console.error('Failed to load tier votes', err);
    }
  }, [configured, item.id, user?.id]);

  // Load cast + crew (TMDB only)
  useEffect(() => {
    if (mediaType === 'movie' || mediaType === 'tv') {
      fetchTmdbCredits(mediaType, externalId)
        .then(({ cast: c, crew: cr }) => { setCast(c); setCrew(cr); })
        .catch(() => undefined);
    }
  }, [mediaType, externalId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    loadTierVotes();
  }, [loadTierVotes]);

  useEffect(() => {
    if (user) recordContinue(item).catch(() => undefined);
  }, [user, item, recordContinue]);

  const myReview = useMemo(
    () => reviews.find((r) => r.userId === user?.id) ?? null,
    [reviews, user],
  );

  useEffect(() => {
    if (myReview) {
      setScore(myReview.score);
      setText(myReview.review);
      // Prefer tier_votes source (always current); fall back to rating row for legacy data
      setSelectedTier(tierVotes?.myTier ?? myReview.tier ?? null);
    }
  }, [myReview]);

  // Merge real + mock reviews for display
  const displayReviews = useMemo(() => {
    if (configured && reviews.length > 0) return reviews;
    if (!configured) {
      const mocks = getMockReviews(item.id);
      return mocks as unknown as Rating[];
    }
    return reviews;
  }, [configured, reviews, item.id]);

  const handleToggleSave = async () => {
    if (!user) { onToast('Sign in to use your watchlist'); return; }
    try {
      const added = await toggleWatchlist(item);
      onToast(added ? 'Added to watchlist' : 'Removed from watchlist');
    } catch { onToast('Something went wrong'); }
  };

  const handleToggleFavorite = async () => {
    if (!user) { onToast('Sign in to save favorites'); return; }
    try {
      const added = await toggleFavorite(item);
      onToast(added ? 'Added to favorites' : 'Removed from favorites');
    } catch { onToast('Something went wrong'); }
  };

  const handleReviewClick = () => {
    if (!user) { onToast('Sign in to write a review'); return; }
    setShowForm((v) => !v);
  };

  const submitReview = async () => {
    if (!user) return;
    if (!selectedTier) {
      onToast('Please pick a verdict tier first');
      return;
    }
    setSubmitting(true);
    try {
      // Save the review — this is the critical write
      await upsertRating({ userId: user.id, author: displayName, item, score, review: text.trim(), tier: selectedTier });
      // Save tier vote — guarded so gauge refresh sees the committed vote
      try { await upsertTierVote(user.id, item.id, selectedTier); } catch { /* non-fatal */ }
      onToast('Review saved');
      setShowForm(false);
      await Promise.all([loadReviews(), loadTierVotes()]);
    } catch {
      onToast('Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Favorite button */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute right-[52px] top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
          favorite
            ? 'border-rose-400/60 bg-rose-500/20 text-rose-300'
            : 'border-white/[0.09] bg-white/[0.045] text-white hover:bg-white/[0.08] hover:border-white/20'
        }`}
        aria-label={favorite ? 'Remove favorite' : 'Add favorite'}
      >
        <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
      </button>

      {/* Hero */}
      <div
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden text-[80px]"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${accent}40, transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
        }}
      >
        {hero ? (
          <img src={hero} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          item.emoji
        )}
      </div>

      <div className="p-6">
        {/* Title + verdict */}
        <h1 className="font-display text-2xl font-extrabold leading-tight">{item.name}</h1>
        <p className="mb-3.5 text-[13px] text-white/55">{item.subtitle}</p>

        <div className="mb-5 flex items-center gap-2.5">
          <span className="tracking-[1px] text-gold-light">{starsFor(item.rating)}</span>
          <span className="text-sm text-white/70">
            {item.rating}/5 • {item.reviews} reviews
          </span>
          <span
            className={`ml-auto rounded-full px-3 py-1 text-[11px] font-bold ${verdictStyles[verdict.key as VerdictKey]}`}
          >
            {verdict.label}
          </span>
        </div>

        {/* Metrics grid */}
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

        {/* Cast + Crew */}
        <CastSection cast={cast} />
        <CrewSection crew={crew} />

        {/* About */}
        <div className="mb-5">
          <h3 className="mb-2.5 text-sm font-bold">About</h3>
          <p className="text-[13px] leading-relaxed text-white/55">
            {item.overview || 'No description available yet.'}
          </p>
        </div>

        {/* Rating Meter — circular gauge */}
        <TierGauge counts={configured ? tierVotes : null} />

        {/* Reviews */}
        <div className="mb-5">
          <h3 className="mb-2.5 text-sm font-bold">Reviews</h3>

          {/* ── Feature 3: Review composer with tier selection ── */}
          {showForm && (
            <div className="mb-3 rounded-[10px] border border-white/[0.09] bg-white/[0.045] p-3">
              <TierPicker value={selectedTier} onChange={setSelectedTier} />
              <StarPicker value={score} onChange={setScore} />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="mt-2.5 w-full resize-none rounded-lg border border-white/[0.09] bg-white/[0.045] p-2.5 text-xs text-white outline-none placeholder:text-white/40 focus:border-white/20"
              />
              <div className="mt-2.5 flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-white/[0.09] bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={submitting || !selectedTier}
                  className="rounded-lg bg-gradient-to-br from-white to-[#e8e8e8] px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Submit'}
                </button>
              </div>
            </div>
          )}

          {/* ── Feature 4 + 5: Review cards with tier badge + seed data ── */}
          <div className="flex flex-col gap-2.5">
            {displayReviews.length === 0 ? (
              <p className="text-xs text-white/40">
                {configured
                  ? 'No reviews yet. Be the first to review.'
                  : 'Sign in to load community reviews.'}
              </p>
            ) : (
              displayReviews.map((r) => (
                <Review
                  key={r.id}
                  user={`@${r.author}`}
                  time={new Date(r.createdAt).toLocaleDateString()}
                  score={r.score}
                  text={r.review}
                  tier={tierVotes?.userTiers[r.userId] ?? r.tier ?? null}
                />
              ))
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mb-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleToggleSave}
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
            onClick={handleReviewClick}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-white to-[#e8e8e8] py-3 text-[13px] font-bold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.2)]"
          >
            <PenLine className="h-4 w-4" />
            {myReview ? 'Edit review' : 'Review'}
          </button>
        </div>
      </div>
    </>
  );
}
