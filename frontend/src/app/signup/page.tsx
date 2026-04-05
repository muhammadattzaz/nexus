'use client';

import { useState } from 'react';
import { useLogin, useRegister } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';

type ActiveTab = 'signin' | 'signup';

export default function SignUpPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('signup');
  return <AuthPage defaultTab={activeTab} onTabChange={setActiveTab} />;
}

function AuthPage({
  defaultTab,
  onTabChange,
}: {
  defaultTab: ActiveTab;
  onTabChange: (t: ActiveTab) => void;
}) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #1C1A16 0%, #2D2A24 100%)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <polygon points="14,2 26,14 14,26 2,14" fill="#C8622A" />
            <polygon points="14,2 26,14 14,14" fill="#A34D1E" opacity="0.5" />
          </svg>
          <span className="text-white text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            NexusAI
          </span>
        </div>

        <div>
          <h1
            className="text-4xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Join 82K+ Builders<br />Using NexusAI
          </h1>
          <ul className="space-y-4">
            {[
              { icon: '🧭', text: 'Guided discovery for 525+ AI models' },
              { icon: '🤖', text: 'Build and deploy custom AI agents in minutes' },
              { icon: '🔬', text: 'Stay current with our daily research feed' },
              { icon: '💰', text: 'Free to start — pay only when you use' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm" style={{ color: '#9E9B93' }}>
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: '#5A5750' }}>
          Trusted by 82,000+ builders worldwide
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-2xl border p-8 shadow-sm"
          style={{ background: '#fff', borderColor: 'var(--border)' }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: 'var(--bg2)' }}
            role="tablist"
          >
            {(['signin', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={defaultTab === tab}
                onClick={() => onTabChange(tab)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: defaultTab === tab ? '#fff' : 'transparent',
                  color: defaultTab === tab ? 'var(--text)' : 'var(--text2)',
                  boxShadow: defaultTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {defaultTab === 'signin' ? <SignInForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const { addToast } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all fields.', 'error');
      return;
    }
    try {
      await login.mutateAsync({ email, password });
    } catch {
      addToast('Invalid email or password. Please try again.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }} htmlFor="si-email">
          Email address
        </label>
        <input
          id="si-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          autoComplete="email"
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
          style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text)' }} htmlFor="si-password">Password</label>
          <a href="#" className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>Forgot password?</a>
        </div>
        <input
          id="si-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
          style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
        />
      </div>
      {login.isError && <p className="text-sm text-red-600">Invalid credentials.</p>}
      <button type="submit" disabled={login.isPending} className="btn-primary w-full justify-center py-2.5">
        {login.isPending ? 'Signing in…' : 'Sign in →'}
      </button>
      <OAuthButtons />
    </form>
  );
}

function SignUpForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    try {
      await register.mutateAsync({ fullName, email, password, confirmPassword });
    } catch {
      setError('Registration failed. That email may already be in use.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }} htmlFor="su-name">Full name</label>
        <input id="su-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" required autoComplete="name"
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'var(--border2)', color: 'var(--text)' }} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }} htmlFor="su-email">Email address</label>
        <input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email"
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'var(--border2)', color: 'var(--text)' }} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }} htmlFor="su-pass">Password</label>
        <input id="su-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required autoComplete="new-password"
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'var(--border2)', color: 'var(--text)' }} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }} htmlFor="su-confirm">Confirm password</label>
        <input id="su-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required autoComplete="new-password"
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'var(--border2)', color: 'var(--text)' }} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={register.isPending} className="btn-primary w-full justify-center py-2.5">
        {register.isPending ? 'Creating account…' : 'Create account →'}
      </button>
      <OAuthButtons />
    </form>
  );
}

function OAuthButtons() {
  const { addToast } = useUIStore();
  return (
    <>
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text3)' }}>or continue with</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ label: 'Google', icon: '🔍' }, { label: 'GitHub', icon: '🐙' }, { label: 'Microsoft', icon: '🪟' }].map((p) => (
          <button key={p.label} type="button" onClick={() => addToast(`${p.label} OAuth — coming soon!`, 'info')}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
            <span aria-hidden="true">{p.icon}</span>{p.label}
          </button>
        ))}
      </div>
    </>
  );
}
