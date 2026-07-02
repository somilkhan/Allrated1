import { useState } from 'react';
import { Zap, SlidersHorizontal, MessageCircle } from 'lucide-react';

interface SpacesScreenProps {
  onToast: (msg: string) => void;
}

type SpacesTab = 'feed' | 'discussion';

const FORECAST_OPTIONS = [
  { key: 'skip', label: 'Skip', emoji: '✕', bg: 'bg-[#3D1515]', text: 'text-red-400', border: 'border-red-900/40' },
  { key: 'timepass', label: 'Timepass', emoji: '⏰', bg: 'bg-[#3D2A10]', text: 'text-orange-400', border: 'border-orange-900/40' },
  { key: 'goforit', label: 'Go For It', emoji: '+', bg: 'bg-[#1A2D1A]', text: 'text-green-400', border: 'border-green-900/40' },
  { key: 'perfection', label: 'Perfection', emoji: '◆', bg: 'bg-[#1E1535]', text: 'text-purple-400', border: 'border-purple-900/40' },
];

const DISCUSSION_POSTS = [
  {
    id: 1,
    tag: 'DISCUSSION SPACE',
    tagColor: 'text-orange-400',
    title: 'Thursday Forecast! 🔴🟡🟢🟣',
    body: "What Are Your Predictions for this Weekend's Releases? 🤔\nLet's predict their Box Office &",
    author: 'AllRated Official',
    time: '1 hr',
    hasMore: true,
  },
  {
    id: 2,
    tag: 'HOT TAKE',
    tagColor: 'text-pink-400',
    title: 'Most Overrated Movie of 2025?',
    body: 'Drop your controversial opinions here. No judgement zone 👇',
    author: 'CinemaFan',
    time: '3 hr',
    hasMore: false,
  },
  {
    id: 3,
    tag: 'POLL',
    tagColor: 'text-blue-400',
    title: 'Best Streaming Platform Right Now?',
    body: 'Netflix vs Prime vs Hotstar — who wins in 2026?',
    author: 'StreamWatcher',
    time: '5 hr',
    hasMore: false,
  },
];

export default function SpacesScreen({ onToast }: SpacesScreenProps) {
  const [tab, setTab] = useState<SpacesTab>('feed');
  const [selectedForecast, setSelectedForecast] = useState<string | null>(null);

  return (
    <div className="px-4 pt-2">
      <div className="mb-4 flex border-b border-white/[0.08]">
        {(['feed', 'discussion'] as SpacesTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-[14px] font-semibold capitalize transition-all ${
              tab === t
                ? 'border-b-2 border-white text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'feed' && (
        <FeedTab
          selectedForecast={selectedForecast}
          onSelectForecast={(k) => {
            setSelectedForecast(k);
            onToast(`Voted: ${FORECAST_OPTIONS.find((o) => o.key === k)?.label}`);
          }}
        />
      )}

      {tab === 'discussion' && (
        <DiscussionTab onToast={onToast} />
      )}
    </div>
  );
}

function FeedTab({
  selectedForecast,
  onSelectForecast,
}: {
  selectedForecast: string | null;
  onSelectForecast: (k: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-white">
          <Zap className="h-4 w-4 text-yellow-400" />
          Topics
        </h2>
        <button className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      <div className="mb-4 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#1A1B1F]">
        <div className="relative bg-gradient-to-br from-[#2D1B69] via-[#1a0533] to-[#0F1014] p-5 text-center">
          <div className="mb-2 flex justify-center gap-4 text-2xl">
            <span>🎟</span>
            <span className="text-white font-black text-2xl">M</span>
            <span>₹</span>
          </div>
          <div className="font-black text-white text-[28px] leading-tight tracking-wider">
            THURSDAY
          </div>
          <div className="font-black text-[32px] leading-tight tracking-wider" style={{
            background: 'linear-gradient(90deg, #FF6B00, #FF4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            FORECAST
          </div>
          <div className="mt-3 flex justify-center gap-2">
            {FORECAST_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => onSelectForecast(opt.key)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-center transition-all ${opt.bg} ${opt.border} ${
                  selectedForecast === opt.key ? 'ring-2 ring-white/40 scale-105' : 'hover:scale-105'
                }`}
              >
                <span className={`text-sm font-bold ${opt.text}`}>{opt.emoji}</span>
                <span className={`text-[10px] font-semibold ${opt.text}`}>{opt.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${i === 0 ? 'h-[6px] w-6 bg-white' : 'h-[6px] w-[6px] bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
              Discussion Space
            </span>
            <MessageCircle className="h-4 w-4 text-white/40" />
          </div>
          <p className="text-[14px] font-bold text-white leading-snug">Thursday Forecast! 🔴🟡🟢🟣</p>
          <p className="mt-1 text-[13px] text-white/50 leading-relaxed">
            What Are Your Predictions for this Weekend's Releases? 🤔
            <br />
            Let's predict their Box Office & <span className="text-white/60 font-medium">...more</span>
          </p>
          <p className="mt-3 text-[12px] text-white/30">By AllRated Official • 1 hr</p>
        </div>
      </div>

      {DISCUSSION_POSTS.slice(1).map((post) => (
        <DiscussionCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function DiscussionTab({ onToast }: { onToast: (msg: string) => void }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-white">Discussions</h2>
        <button
          onClick={() => onToast('Create discussion coming soon')}
          className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
        >
          + New
        </button>
      </div>
      {DISCUSSION_POSTS.map((post) => (
        <DiscussionCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function DiscussionCard({ post }: { post: typeof DISCUSSION_POSTS[0] }) {
  return (
    <div className="mb-3 rounded-2xl border border-white/[0.08] bg-[#1A1B1F] p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${post.tagColor}`}>
          {post.tag}
        </span>
        <MessageCircle className="h-4 w-4 text-white/30 ml-auto" />
      </div>
      <p className="text-[14px] font-bold text-white leading-snug">{post.title}</p>
      <p className="mt-1 text-[13px] text-white/50 leading-relaxed">{post.body}</p>
      {post.hasMore && <span className="text-[13px] text-white/60 font-medium">...more</span>}
      <p className="mt-3 text-[12px] text-white/30">By {post.author} • {post.time}</p>
    </div>
  );
}
