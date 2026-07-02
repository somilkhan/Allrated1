import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Bookmark, PenLine, Heart, Loader2, Star } from 'lucide-react';
import {
  getMetrics,
  getVerdict,
  starsFor,
  verdictStyles,
} from '../data/catalog';
import type { Item } from '../data/catalog';
import { useDetails } from '../hooks/useDetails';
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
  const { item, loading, error } = useDetails(id);

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
  const [showForm, setShowForm] = useState(false);
  const [score, setScore] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const verdict = getVerdict(item.rating);
  const metrics = getMetrics(item);
  const hero = item.backdrop ?? item.image;

  const loadReviews = useCallback(async () => {
    if (!configured) return;
    try {
      const data = await fetchRatings(item.id);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  }, [configured, item.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

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
    }
  }, [myReview]);

  const handleToggleSave = async () => {
    if (!user) {
      onToast('Sign in to use your watchlist');
      return;
    }
    try {
      const added = await toggleWatchlist(item);
      onToast(added ? 'Added to watchlist' : 'Removed from watchlist');
    } catch {
      onToast('Something went wrong');
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      onToast('Sign in to save favorites');
      return;
    }
    try {
      const added = await toggleFavorite(item);
      onToast(added ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      onToast('Something went wrong');
    }
  };

  const handleReviewClick = () => {
    if (!user) {
      onToast('Sign in to write a review');
      return;
    }
    setShowForm((v) => !v);
  };

  const submitReview = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await upsertRating({
        userId: user.id,
        author: displayName,
        item,
        score,
        review: text.trim(),
      });
      onToast('Review saved');
      setShowForm(false);
      await loadReviews();
    } catch {
      onToast('Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
            {item.overview || 'No description available yet.'}
          </p>
        </div>

        <div className="mb-5">
          <h3 className="mb-2.5 text-sm font-bold">Reviews</h3>
          {showForm && (
            <div className="mb-3 rounded-[10px] border border-white/[0.09] bg-white/[0.045] p-3">
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
                  disabled={submitting}
                  className="rounded-lg bg-gradient-to-br from-white to-[#e8e8e8] px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Submit'}
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            {reviews.length === 0 ? (
              <p className="text-xs text-white/40">
                {configured
                  ? 'No reviews yet. Be the first to review.'
                  : 'Sign-in required to load community reviews.'}
              </p>
            ) : (
              reviews.map((r) => (
                <Review
                  key={r.id}
                  user={`@${r.author}`}
                  time={new Date(r.createdAt).toLocaleDateString()}
                  score={r.score}
                  text={r.review}
                />
              ))
            )}
          </div>
        </div>

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
}: {
  user: string;
  time: string;
  score: number;
  text: string;
}) {
  return (
    <div className="rounded-[10px] border border-white/[0.09] bg-white/[0.045] p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
        <span>{user}</span>
        <span className="text-gold-light">{starsFor(score)}</span>
        <span className="ml-auto text-white/40">{time}</span>
      </div>
      {text && <div className="text-xs leading-relaxed text-white/55">{text}</div>}
    </div>
  );
}
