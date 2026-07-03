import { useState } from 'react';
import { ChevronLeft, Camera, Edit3, List, LogOut, Search } from 'lucide-react';
import { useUserData } from '../context/userDataContext';
import type { Item } from '../data/catalog';

interface ProfileScreenProps {
  displayName: string;
  onSignOut: () => void;
  onToast: (msg: string) => void;
}

type ProfileView = 'main' | 'edit';
type ReviewsView = 'list' | 'grid';

const VERDICT_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  perfection: { label: 'Perfection', bg: 'bg-purple-900/60', text: 'text-purple-300' },
  goforit: { label: 'Go For It', bg: 'bg-green-900/60', text: 'text-green-400' },
  timepass: { label: 'Timepass', bg: 'bg-orange-900/60', text: 'text-orange-400' },
  skip: { label: 'Skip', bg: 'bg-red-900/60', text: 'text-red-400' },
};

export default function ProfileScreen({ displayName, onSignOut, onToast }: ProfileScreenProps) {
  const [view, setView] = useState<ProfileView>('main');
  const { user, watchlist, favorites } = useUserData();
  const [reviewsTab, setReviewsTab] = useState<'reviews' | 'lists'>('reviews');
  const [reviewsView, setReviewsView] = useState<ReviewsView>('list');
  const [reviewFilter, setReviewFilter] = useState('All Reviews');

  const username = user?.email?.split('@')[0] || displayName?.toLowerCase().replace(/\s+/g, '') || 'user';
  const joinedMonths = 8;

  if (view === 'edit') {
    return <EditProfileView displayName={displayName} onBack={() => setView('main')} onToast={onToast} />;
  }

  return (
    <div className="px-4 pt-3 pb-8">
      {/* Top stats row */}
      <div className="flex items-start gap-4 mb-4">
        <div className="h-20 w-20 flex-shrink-0 rounded-full bg-gradient-to-br from-[#2a2a40] to-[#1a1a2e] border-2 border-white/10 flex items-center justify-center overflow-hidden">
          <span className="text-white font-black text-2xl uppercase">{displayName?.[0] || 'A'}</span>
        </div>
        <div className="flex flex-1 items-start justify-around pt-2">
          <div className="text-center">
            <p className="text-[20px] font-black text-white">{watchlist.length}</p>
            <p className="text-[11px] text-white/45 leading-tight mt-0.5">Reviews<br/>Posted</p>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-black text-white">{favorites.length}</p>
            <p className="text-[11px] text-white/45 leading-tight mt-0.5">Public<br/>Collections</p>
          </div>
        </div>
      </div>

      {/* Name & handle */}
      <div className="mb-3">
        <h2 className="text-[18px] font-bold text-white">{displayName || 'Guest User'}</h2>
        <p className="text-[13px] text-white/45 mt-0.5">@{username}</p>
      </div>

      {/* Followers / Following / Joined */}
      <div className="mb-1 flex items-center gap-2 text-[13px] text-white/50">
        <span>👥</span>
        <span className="font-semibold text-white/80">0 Followers</span>
        <span>•</span>
        <span className="font-semibold text-white/80">0 Following</span>
      </div>
      <div className="mb-4 flex items-center gap-2 text-[13px] text-white/45">
        <span>📅</span>
        <span>Joined {joinedMonths} months ago</span>
      </div>

      {/* Edit Profile button */}
      <button
        onClick={() => setView('edit')}
        className="mb-5 w-full rounded-xl border border-white/10 bg-white/[0.07] py-3 text-[14px] font-semibold text-white hover:bg-white/[0.12] transition-colors"
      >
        Edit Profile
      </button>

      {/* Interested In */}
      {watchlist.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2.5 text-[15px] font-bold text-white">Interested In</h3>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {watchlist.slice(0, 8).map((item) => (
              <InterestedCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews / Lists tabs */}
      <div className="mb-3 flex items-center justify-between border-b border-white/[0.08] pb-0">
        <div className="flex">
          <button
            onClick={() => setReviewsTab('reviews')}
            className={`flex items-center gap-2 px-3 pb-3 pt-1 transition-all ${
              reviewsTab === 'reviews' ? 'border-b-2 border-white text-white' : 'text-white/35'
            }`}
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setReviewsTab('lists')}
            className={`flex items-center gap-2 px-3 pb-3 pt-1 transition-all ${
              reviewsTab === 'lists' ? 'border-b-2 border-white text-white' : 'text-white/35'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Reviews filters */}
      {reviewsTab === 'reviews' && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => {
                const opts = ['All Reviews', 'Perfection', 'Go For It', 'Timepass', 'Skip'];
                const cur = opts.indexOf(reviewFilter);
                setReviewFilter(opts[(cur + 1) % opts.length]);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[13px] font-semibold text-white/80"
            >
              {reviewFilter} ↓
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReviewsView('list')}
                className={`p-1.5 rounded transition-colors ${reviewsView === 'list' ? 'text-white' : 'text-white/30'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setReviewsView('grid')}
                className={`p-1.5 rounded transition-colors ${reviewsView === 'grid' ? 'text-white' : 'text-white/30'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="0" y="0" width="7" height="7" rx="1"/><rect x="9" y="0" width="7" height="7" rx="1"/>
                  <rect x="0" y="9" width="7" height="7" rx="1"/><rect x="9" y="9" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button className="p-1.5 rounded text-white/30 hover:text-white transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {watchlist.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-[13px]">
              No reviews yet. Start rating movies!
            </div>
          ) : reviewsView === 'list' ? (
            <div className="flex flex-col gap-0 divide-y divide-white/[0.06]">
              {watchlist.slice(0, 10).map((item) => (
                <ReviewListItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {watchlist.slice(0, 12).map((item) => (
                <div key={item.id} className="aspect-[2/3] rounded-xl overflow-hidden bg-white/10">
                  {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {reviewsTab === 'lists' && (
        <div className="py-12 text-center text-white/30 text-[13px]">
          No lists yet. Create your first collection!
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl border border-red-900/40 bg-red-950/30 py-3 text-[14px] font-semibold text-red-400 hover:bg-red-950/50 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}

function InterestedCard({ item }: { item: Item }) {
  const label = item.subtitle || 'In Theatre';
  return (
    <div className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1A1B1F] p-2.5 w-[160px]">
      <div className="h-12 w-8 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-white truncate">{item.name}</p>
        <p className="text-[10px] text-white/35 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

function ReviewListItem({ item }: { item: Item }) {
  const verdicts = ['goforit', 'perfection', 'timepass', 'skip'];
  const verdict = verdicts[Math.floor(Math.random() * 2)]; // first 2 are positive
  const v = VERDICT_STYLES[verdict];
  const year = new Date().getFullYear();

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-14 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-white truncate">{item.name}</p>
        <p className="text-[12px] text-white/40 mt-0.5">
          {item.mediaType === 'movie' ? 'Movie' : item.mediaType === 'tv' ? 'Series' : 'Anime'} • {year}
        </p>
      </div>
      <span className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold ${v.bg} ${v.text}`}>
        {v.label}
      </span>
    </div>
  );
}

function EditProfileView({
  displayName,
  onBack,
  onToast,
}: {
  displayName: string;
  onBack: () => void;
  onToast: (msg: string) => void;
}) {
  const [firstName, setFirstName] = useState(displayName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(displayName?.split(' ')[1] || '');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');

  return (
    <div className="px-4 pt-2 pb-10">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-[14px]">
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      </div>
      <h1 className="text-[20px] font-bold text-white mb-5">Edit Profile</h1>

      {/* Profile photo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative mb-2">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#2a2a40] to-[#1a1a2e] border-2 border-white/10 flex items-center justify-center">
            <span className="text-white font-black text-2xl uppercase">{firstName?.[0] || 'A'}</span>
          </div>
          <button
            onClick={() => onToast('Photo upload coming soon')}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1B1F] border border-white/15 hover:bg-white/10 transition-colors"
          >
            <Camera className="h-3.5 w-3.5 text-white/70" />
          </button>
        </div>
        <p className="text-[13px] text-white/60 font-medium">Profile photo</p>
        <p className="text-[12px] text-white/30">Upload a new profile photo</p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 mb-6">
        <EditField label="First name" value={firstName} onChange={setFirstName} />
        <EditField label="Last name" value={lastName} onChange={setLastName} />
        <EditField label="Date of birth" value={dob} onChange={setDob} placeholder="DD/MM/YYYY" hint="This won't be shown publicly. Enter in DD/MM/YYYY format." />
        <EditField label="Bio" value={bio} onChange={setBio} placeholder="Tell us about yourself" hint="Write a short bio to tell people more about yourself." multiline />
      </div>

      {/* Social Links */}
      <div className="mb-6">
        <div className="mb-4 h-px bg-white/[0.08]" />
        <h3 className="text-[16px] font-bold text-white mb-4">Social Links</h3>
        <div className="flex flex-col gap-4">
          <EditField label="Instagram" value={instagram} onChange={setInstagram} placeholder="@ username or paste Instagram profile URL" />
          <EditField label="X / Twitter" value={twitter} onChange={setTwitter} placeholder="@ username or paste X/Twitter profile URL" />
          <EditField label="YouTube" value={youtube} onChange={setYoutube} placeholder="@ username or paste YouTube channel URL" />
        </div>
      </div>

      <button
        onClick={() => { onToast('Profile updated!'); onBack(); }}
        className="w-full rounded-xl bg-white py-3.5 text-[14px] font-bold text-[#0F1014] hover:bg-white/90 transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
}) {
  const cls = "w-full rounded-xl border border-white/[0.08] bg-[#1A1B1F] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/25 focus:border-white/20 focus:bg-[#21222A] transition-all";
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-white/70">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={cls + ' resize-none'}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
      {hint && <p className="mt-1 text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}
