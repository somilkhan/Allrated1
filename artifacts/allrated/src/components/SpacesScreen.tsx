import { useState } from 'react';
import { Zap, SlidersHorizontal, MessageCircle } from 'lucide-react';

interface SpacesScreenProps {
  onToast: (msg: string) => void;
}

type SpacesTab = 'feed' | 'discussion';

const FORECAST_OPTIONS = [
  {
    key: 'skip',
    label: 'Skip',
    icon: '✕',
    bg: 'bg-[#2D0F0F]',
    border: 'border-[#5C1A1A]',
    text: 'text-red-400',
    activeBg: 'bg-[#5C1A1A]',
  },
  {
    key: 'timepass',
    label: 'Timepass',
    icon: '⏰',
    bg: 'bg-[#2D1A0F]',
    border: 'border-[#5C3A1A]',
    text: 'text-orange-400',
    activeBg: 'bg-[#5C3A1A]',
  },
  {
    key: 'goforit',
    label: 'Go For It',
    icon: '+',
    bg: 'bg-[#0F2D15]',
    border: 'border-[#1A5C2A]',
    text: 'text-green-400',
    activeBg: 'bg-[#1A5C2A]',
  },
  {
    key: 'perfection',
    label: 'Perfection',
    icon: '💎',
    bg: 'bg-[#1A0F2D]',
    border: 'border-[#3A1A5C]',
    text: 'text-purple-400',
    activeBg: 'bg-[#3A1A5C]',
  },
];

const DISCUSSION_POSTS = [
  {
    id: 1,
    tag: 'DISCUSSION SPACE',
    tagColor: 'text-orange-400',
    tagBg: 'bg-orange-500/15',
    title: 'Thursday Forecast! 🔴🟡🟢🟣',
    body: "What Are Your Predictions for this Weekend's Releases? 🤔\nLet's predict their Box Office & ...more",
    author: 'AllRated Official',
    time: '1 hr',
  },
  {
    id: 2,
    tag: 'HOT TAKE',
    tagColor: 'text-pink-400',
    tagBg: 'bg-pink-500/15',
    title: 'Most Overrated Movie of 2025?',
    body: 'Drop your controversial opinions here. No judgement zone 👇',
    author: 'CinemaFan',
    time: '3 hr',
  },
  {
    id: 3,
    tag: 'POLL',
    tagColor: 'text-blue-400',
    tagBg: 'bg-blue-500/15',
    title: 'Best Streaming Platform Right Now?',
    body: 'Netflix vs Prime vs Hotstar — who wins in 2026?',
    author: 'StreamWatcher',
    time: '5 hr',
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
            const opt = FORECAST_OPTIONS.find((o) => o.key === k);
            onToast(`Voted: ${opt?.label}`);
          }}
          posts={DISCUSSION_POSTS}
        />
      )}

      {tab === 'discussion' && (
        <DiscussionTab onToast={onToast} posts={DISCUSSION_POSTS} />
      )}
    </div>
  );
}

function FeedTab({
  selectedForecast,
  onSelectForecast,
  posts,
}: {
  selectedForecast: string | null;
  onSelectForecast: (k: string) => void;
  posts: typeof DISCUSSION_POSTS;
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
          <span>1</span>
        </button>
      </div>

      {/* Thursday Forecast card */}
      <div className="mb-4 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#1A1B1F]">
        {/* Forecast banner */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0830 0%, #2d1060 40%, #0a0a1a 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #7c3aed 0%, transparent 60%), radial-gradient(circle at 70% 50%, #b91c1c 0%, transparent 60%)' }} />
          <div className="relative p-5 text-center">
            <div className="mb-3 flex justify-center items-center gap-4 text-xl">
              <span>🎟</span>
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-white font-black text-lg">M</span>
              </div>
              <span>₹</span>
            </div>
            <p className="font-black text-white text-[28px] leading-none tracking-widest mb-0.5">THURSDAY</p>
            <p
              className="font-black text-[32px] leading-tight tracking-widest"
              style={{ background: 'linear-gradient(90deg, #FF8C00, #FF3333)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              FORECAST
            </p>

            {/* Rating buttons */}
            <div className="mt-4 flex justify-center gap-2">
              {FORECAST_OPTIONS.map((opt) => {
                const isSelected = selectedForecast === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => onSelectForecast(opt.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition-all ${
                      isSelected ? `${opt.activeBg} ${opt.border} ring-1 ring-white/30 scale-105` : `${opt.bg} ${opt.border} hover:scale-105`
                    }`}
                  >
                    <span className="text-base leading-none">{opt.icon}</span>
                    <span className={`text-[9px] font-bold ${opt.text} leading-tight text-center`}>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dot nav */}
            <div className="mt-4 flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all ${i === 0 ? 'h-[5px] w-6 bg-white' : 'h-[5px] w-[5px] bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Post body */}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
              📣 DISCUSSION SPACE
            </span>
            <MessageCircle className="h-4 w-4 text-white/30" />
          </div>
          <p className="text-[14px] font-bold text-white leading-snug">{posts[0].title}</p>
          <p className="mt-1 text-[13px] text-white/50 leading-relaxed">{posts[0].body}</p>
          <p className="mt-3 text-[12px] text-white/30">By {posts[0].author} • {posts[0].time}</p>
        </div>
      </div>

      {posts.slice(1).map((post) => (
        <DiscussionCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function DiscussionTab({ onToast, posts }: { onToast: (msg: string) => void; posts: typeof DISCUSSION_POSTS }) {
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
      {posts.map((post) => (
        <DiscussionCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function DiscussionCard({ post }: { post: typeof DISCUSSION_POSTS[0] }) {
  return (
    <div className="mb-3 rounded-2xl border border-white/[0.08] bg-[#1A1B1F] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${post.tagBg} ${post.tagColor}`}>
          {post.tag}
        </span>
        <MessageCircle className="h-4 w-4 text-white/30" />
      </div>
      <p className="text-[14px] font-bold text-white leading-snug">{post.title}</p>
      <p className="mt-1 text-[13px] text-white/50 leading-relaxed whitespace-pre-line">{post.body}</p>
      <p className="mt-3 text-[12px] text-white/30">By {post.author} • {post.time}</p>
    </div>
  );
}
