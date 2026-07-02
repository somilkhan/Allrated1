import { useState } from 'react';
import { ChevronLeft, Camera, LogOut, Bell, Shield, HelpCircle, ChevronRight, Star } from 'lucide-react';
import { useUserData } from '../context/userDataContext';

interface ProfileScreenProps {
  displayName: string;
  onSignOut: () => void;
  onToast: (msg: string) => void;
}

type ProfileView = 'main' | 'edit';

export default function ProfileScreen({ displayName, onSignOut, onToast }: ProfileScreenProps) {
  const [view, setView] = useState<ProfileView>('main');
  const { user, watchlist, favorites } = useUserData();

  if (view === 'edit') {
    return <EditProfileView displayName={displayName} onBack={() => setView('main')} onToast={onToast} />;
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
            <span className="text-white font-black text-2xl uppercase">
              {displayName?.[0] || 'A'}
            </span>
          </div>
        </div>
        <h2 className="text-[18px] font-bold text-white">{displayName || 'Guest User'}</h2>
        {user?.email && (
          <p className="text-[13px] text-white/40 mt-0.5">{user.email}</p>
        )}
        <button
          onClick={() => setView('edit')}
          className="mt-3 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.07] transition-colors"
        >
          Edit Profile
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Watchlist', value: watchlist.length },
          { label: 'Favorites', value: favorites.length },
          { label: 'Reviews', value: 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/[0.08] bg-[#1A1B1F] py-3">
            <p className="text-[20px] font-black text-white">{stat.value}</p>
            <p className="text-[11px] text-white/40 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2 px-1">Account</h3>
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1B1F] overflow-hidden divide-y divide-white/[0.06]">
          {[
            { icon: <Bell className="h-4 w-4" />, label: 'Notifications', action: () => onToast('Notifications settings') },
            { icon: <Shield className="h-4 w-4" />, label: 'Privacy', action: () => onToast('Privacy settings') },
            { icon: <HelpCircle className="h-4 w-4" />, label: 'Help & Support', action: () => onToast('Help & Support') },
            { icon: <Star className="h-4 w-4" />, label: 'About AllRated', action: () => onToast('AllRated v1.0') },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-white/50">{item.icon}</span>
              <span className="flex-1 text-[14px] font-medium text-white/80">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-white/20" />
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-900/40 bg-red-950/30 py-3.5 text-[14px] font-semibold text-red-400 hover:bg-red-950/50 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>

      <div className="h-8" />
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
  const [firstName, setFirstName] = useState(displayName || '');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');

  return (
    <div className="px-4 pt-2">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[17px] font-bold text-white">Edit Profile</h1>
      </div>

      <div className="mb-6 flex flex-col items-center">
        <div className="relative mb-2">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
            <span className="text-white font-black text-2xl uppercase">
              {firstName?.[0] || 'A'}
            </span>
          </div>
          <button
            onClick={() => onToast('Photo upload coming soon')}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            <Camera className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
        <p className="text-[13px] text-white/40">Profile photo</p>
        <p className="text-[12px] text-white/25">Upload a new profile photo</p>
      </div>

      <div className="flex flex-col gap-4">
        {[
          { label: 'First name', value: firstName, onChange: setFirstName, type: 'text' },
          { label: 'Last name', value: lastName, onChange: setLastName, type: 'text' },
          { label: 'Date of birth', value: dob, onChange: setDob, type: 'text', placeholder: 'DD/MM/YYYY', hint: "This won't be shown publicly. Enter in DD/MM/YYYY format." },
          { label: 'Bio', value: bio, onChange: setBio, type: 'text', placeholder: 'Write something about yourself...' },
        ].map((field) => (
          <div key={field.label}>
            <label className="mb-1.5 block text-[13px] font-medium text-white/60">{field.label}</label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-white/[0.08] bg-[#1A1B1F] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/25 focus:border-white/20 focus:bg-[#21222A] transition-all"
            />
            {field.hint && (
              <p className="mt-1 text-[11px] text-white/30">{field.hint}</p>
            )}
          </div>
        ))}

        <button
          onClick={() => { onToast('Profile updated!'); onBack(); }}
          className="mt-2 w-full rounded-xl bg-white py-3.5 text-[14px] font-bold text-[#0F1014] hover:bg-white/90 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="h-8" />
    </div>
  );
}
