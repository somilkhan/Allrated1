import { useState } from 'react';
import { useUserData } from '../context/userDataContext';

interface AuthScreenProps {
  onToast: (msg: string) => void;
  onSkip: () => void;
}

type Tab = 'login' | 'signup';

export function AuthScreen({ onToast, onSkip }: AuthScreenProps) {
  const { configured, signIn, signUp } = useUserData();
  const [tab, setTab] = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!configured) {
      onToast('Auth is not configured. Add Supabase keys to .env');
      return;
    }
    setBusy(true);
    try {
      if (tab === 'signup') {
        await signUp(email.trim(), password, username.trim());
        onToast('Account created — check your email to confirm, then sign in');
        setTab('login');
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen">
      {/* Left panel — desktop only: dark with phone mockup */}
      <div className="hidden lg:flex fixed left-0 top-0 w-1/2 h-screen bg-[#0F1014] flex-col items-center justify-center">
        <div className="relative w-[320px] h-[560px] flex items-center justify-center">
          <div className="w-[240px] h-[480px] rounded-[40px] border-4 border-white/20 bg-[#1a1b20] shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
            <div className="bg-[#1a1b20] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-white/20 flex items-center justify-center">
                  <span className="text-white font-black text-[8px]">AR</span>
                </div>
                <span className="text-white font-black text-[10px] uppercase tracking-wider">AllRated</span>
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-b from-[#1a1b20] to-[#0F1014] p-3">
              <div className="mb-2 text-[9px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                🔥 Most Interested
              </div>
              {['Alpha', 'Death Robin Hood', 'Toxic', 'Welcome to the Jungle'].map((title, i) => (
                <div key={i} className="flex items-center gap-2 mb-2 rounded-xl bg-white/[0.06] p-2">
                  <span className="text-[18px] font-black text-white/15 w-5 text-center leading-none">{i + 1}</span>
                  <div className="h-8 w-6 rounded-lg bg-white/10 flex-shrink-0" />
                  <div>
                    <p className="text-white text-[9px] font-semibold leading-tight">{title}</p>
                    <p className="text-orange-400 text-[8px] mt-0.5">🔥 {(2.1 - i * 0.3).toFixed(1)}K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,16,20,0) 50%, #0F1014 90%)' }} />
        </div>
        <div className="absolute bottom-[10vh] px-12 text-center">
          <h2 className="text-white text-[20px] font-semibold leading-snug max-w-[280px] mx-auto">
            Exclusive access to curated movie selections
          </h2>
        </div>
        <div className="absolute bottom-[6vh] flex items-center gap-3">
          <div className="h-[6px] w-8 bg-white rounded-sm" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[6px] w-[6px] bg-white rounded-full opacity-40" />
          ))}
        </div>
      </div>

      {/* Right panel — gradient background */}
      <div className="w-full lg:w-1/2 lg:ml-[50vw] min-h-screen flex flex-col items-center justify-start bg-gradient-to-l from-[#E07288] to-[#532863]">
        <div className="w-full flex flex-col items-center pt-[15%] md:pt-[8%] pb-10 px-4">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md">
              <span className="text-[#532863] font-black text-sm">AR</span>
            </div>
            <span className="text-white font-black text-[24px] tracking-wider uppercase">AllRated</span>
          </div>

          {/* White card */}
          <div className="w-full max-w-[400px] bg-white rounded-2xl py-8 px-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col items-center">
            {/* Tab switcher */}
            <div className="flex w-full mb-6 gap-1 rounded-xl bg-gray-100 p-1">
              {(['login', 'signup'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-all ${
                    tab === t ? 'bg-white text-[#0F1014] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <h1 className="text-[20px] font-bold text-[#0F1014] text-center mb-5">
              {tab === 'login' ? 'Log In' : 'Create Account'}
            </h1>

            <form onSubmit={submit} className="w-full flex flex-col gap-4">
              {tab === 'signup' && (
                <AuthField
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={setUsername}
                />
              )}
              <AuthField
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={setEmail}
              />
              <AuthField
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
              />

              <button
                type="submit"
                disabled={busy}
                className="mt-1 w-full h-[44px] bg-[#0F1014] text-white rounded-xl font-semibold text-[14px] hover:bg-[#0F1014]/80 transition-colors disabled:opacity-50"
              >
                {busy ? 'Please wait…' : tab === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-[14px] font-semibold text-[#0F1014]">
                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
                  className="hover:underline text-[#532863] font-bold"
                >
                  {tab === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          </div>

          {/* Browse without signing in */}
          <button
            type="button"
            onClick={onSkip}
            className="mt-6 text-[13px] text-white/75 hover:text-white transition-colors underline underline-offset-2"
          >
            Browse without signing in →
          </button>
        </div>
      </div>
    </div>
  );
}

interface AuthFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

function AuthField({ label, type, placeholder, value, onChange }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-medium text-[#0F1014]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[42px] px-3 bg-white rounded-lg border border-gray-300 text-[#0F1014] text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#532863]/40"
      />
    </div>
  );
}
