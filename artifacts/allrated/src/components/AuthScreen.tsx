import { useState } from 'react';
import { Mail, Lock, User, Star, Sparkles } from 'lucide-react';
import { useUserData } from '../context/userDataContext';

interface AuthScreenProps {
  onToast: (msg: string) => void;
  onSkip: () => void;
}

type Tab = 'login' | 'signup';

export function AuthScreen({ onToast, onSkip }: AuthScreenProps) {
  const { configured, signIn, signUp } = useUserData();
  const [tab, setTab] = useState<Tab>('login');
  const [name, setName] = useState('');
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
        await signUp(email.trim(), password, name.trim());
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-gradient-to-br from-ink-900 to-[#0f0408] animate-fade-in">
      <div className="w-full max-w-[420px] px-5 py-8">
        <div className="rounded-3xl border border-white/[0.09] bg-ink-600/60 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <span className="mb-4 inline-block animate-bounce-slow text-5xl">⭐</span>
            <h1 className="font-display text-3xl font-black tracking-tight">AllRated</h1>
            <p className="mt-2 text-sm text-white/55">Rate everything you love</p>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.045] p-1">
            {(['login', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-[13px] font-bold transition-all ${
                  tab === t
                    ? 'bg-white/10 text-white'
                    : 'text-white/55 hover:text-white/80'
                }`}
              >
                {t === 'login' ? <Lock className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                {t === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {tab === 'signup' && (
              <Field
                icon={<User className="h-3.5 w-3.5" />}
                type="text"
                placeholder="Name"
                value={name}
                onChange={setName}
              />
            )}
            <Field
              icon={<Mail className="h-3.5 w-3.5" />}
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
            />
            <Field
              icon={<Lock className="h-3.5 w-3.5" />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-xl bg-gradient-to-br from-white to-[#e8e8e8] py-3.5 text-sm font-bold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? 'Please wait…'
                : tab === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>

          <div className="my-4 text-xs text-white/55">
            <span className="relative px-3">or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onToast('Social sign-in coming soon')}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.045] py-3 text-sm font-semibold transition-all hover:bg-white/[0.08]"
            >
              <Star className="h-4 w-4" /> Google
            </button>
            <button
              type="button"
              onClick={() => onToast('Social sign-in coming soon')}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.045] py-3 text-sm font-semibold transition-all hover:bg-white/[0.08]"
            >
              <Star className="h-4 w-4" /> Apple
            </button>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="mt-5 w-full text-center text-[13px] text-white/40 underline underline-offset-2 hover:text-white/70 transition-colors"
          >
            Browse without signing in →
          </button>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

function Field({ icon, type, placeholder, value, onChange }: FieldProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.045] px-4 transition-all focus-within:border-white/20 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
      <span className="text-white/55">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/55"
      />
    </div>
  );
}
