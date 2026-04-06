'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/layout/AppNav';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile, useLogout } from '@/hooks/useAuth';
import { useAgents } from '@/hooks/useAgents';
import { useUIStore, type ThemeName } from '@/store/uiStore';
import api from '@/lib/axios';

type Tab = 'overview' | 'profile' | 'security' | 'plan' | 'preferences';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'overview',     icon: '◎',  label: 'Overview' },
  { id: 'profile',      icon: '✎',  label: 'Edit Profile' },
  { id: 'security',     icon: '🔒', label: 'Security' },
  { id: 'plan',         icon: '⭐', label: 'Plan & Billing' },
  { id: 'preferences',  icon: '⚙',  label: 'Preferences' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' }, { value: 'es', label: 'Español' },
  { value: 'zh', label: '中文' },    { value: 'ja', label: '日本語' },
  { value: 'ar', label: 'العربية' }, { value: 'pt', label: 'Português' },
  { value: 'hi', label: 'हिन्दी' },  { value: 'ur', label: 'اردو' },
];

const PALETTE: { id: ThemeName; color: string; label: string; desc: string }[] = [
  { id: 'orange', color: '#C8622A', label: 'Ember',  desc: 'Warm terracotta — the default' },
  { id: 'teal',   color: '#39bca9', label: 'Ocean',  desc: 'Fresh teal — calm & modern' },
  { id: 'purple', color: '#7c3aed', label: 'Violet', desc: 'Deep purple — bold & creative' },
];

const PLAN_META = {
  free:       { color: 'var(--text2)',  bg: 'var(--bg2)',      label: 'Free' },
  pro:        { color: '#d97706',       bg: '#fffbeb',         label: 'Pro' },
  enterprise: { color: 'var(--teal)',   bg: 'var(--teal-lt)',  label: 'Enterprise' },
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, accessToken, clearAuth } = useAuthStore();
  const { addToast, theme, setTheme } = useUIStore();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const { data: agents = [] } = useAgents();

  const [tab, setTab] = useState<Tab>('overview');

  // Edit profile form state
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [language, setLanguage] = useState('en');
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  // Security form state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Preferences
  const [notifEmails, setNotifEmails] = useState(true);
  const [notifProduct, setNotifProduct] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/signin'); return; }
    if (user) {
      setFullName(user.fullName ?? '');
      setAvatar(user.avatar ?? '');
      setLanguage(user.language ?? 'en');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) return null;

  const avatarInitials = initials(user.fullName);
  const memberDays = daysSince(user.createdAt);
  const deployedAgents = agents.filter((a) => a.status === 'deployed').length;
  const totalTools = [...new Set(agents.flatMap((a) => a.tools))].length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    if (fullName.trim() && fullName.trim() !== user.fullName) payload.fullName = fullName.trim();
    if (avatar.trim() !== (user.avatar ?? '')) payload.avatar = avatar.trim();
    if (language !== user.language) payload.language = language;
    if (!Object.keys(payload).length) { addToast('No changes to save.', 'info'); return; }
    try {
      await updateProfile.mutateAsync(payload);
      addToast('Profile updated!', 'success');
      setShowAvatarInput(false);
    } catch {
      addToast('Failed to update profile.', 'error');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { addToast('Passwords do not match.', 'error'); return; }
    addToast('Password change coming soon.', 'info');
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.email) { addToast('Email does not match.', 'error'); return; }
    setDeleting(true);
    try {
      await api.delete(`/users/${user._id}`);
      clearAuth();
      router.push('/');
    } catch {
      addToast('Failed to delete account.', 'error');
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const planInfo = PLAN_META[user.plan] ?? PLAN_META.free;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AppNav />

      {/* ── Hero / Cover ─────────────────────────────────────────────────── */}
      <div
        className="pt-16"
        style={{
          background: `linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 rounded-3xl border-4 border-white/30 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-xl"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              ) : avatarInitials}
            </div>
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white" style={{ background: '#22c55e' }} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 text-center sm:text-left pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                {user.fullName}
              </h1>
              <span
                className="self-center sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                {user.plan}
              </span>
            </div>
            <p className="text-sm text-white/70">{user.email}</p>
            <p className="text-xs text-white/50 mt-1">Member for {memberDays} days</p>
          </div>

          {/* Stats strip */}
          <div className="flex gap-5 sm:gap-6 text-center pb-1">
            {[
              { label: 'Agents', value: agents.length },
              { label: 'Deployed', value: deployedAgents },
              { label: 'Tools', value: totalTools },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar tabs ─────────────────────────────────────────── */}
          <aside className="lg:w-52 shrink-0">
            <nav
              className="rounded-2xl border overflow-hidden"
              style={{ background: '#fff', borderColor: 'var(--border)' }}
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left"
                  style={{
                    background: tab === t.id ? 'var(--accent-lt)' : 'transparent',
                    color: tab === t.id ? 'var(--accent)' : 'var(--text2)',
                    borderLeft: tab === t.id ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                >
                  <span className="text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}

              <div className="border-t mx-4 my-1" style={{ borderColor: 'var(--border)' }} />

              <button
                onClick={() => logout.mutate()}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left"
                style={{ color: 'var(--rose)' }}
              >
                <span className="text-base">🚪</span>
                Sign out
              </button>
            </nav>
          </aside>

          {/* ── Main content ─────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* ──────────────── OVERVIEW ──────────────── */}
            {tab === 'overview' && (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Agents', value: agents.length, icon: '🤖', color: 'var(--accent-lt)', text: 'var(--accent)' },
                    { label: 'Deployed', value: deployedAgents, icon: '🚀', color: 'var(--teal-lt)', text: 'var(--teal)' },
                    { label: 'Unique Tools', value: totalTools, icon: '🔧', color: 'var(--blue-lt)', text: 'var(--blue)' },
                    { label: 'Days Active', value: memberDays, icon: '📅', color: 'var(--amber-lt)', text: 'var(--amber)' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border p-4 flex flex-col gap-1" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-1" style={{ background: s.color }}>
                        {s.icon}
                      </div>
                      <p className="text-2xl font-bold" style={{ color: s.text }}>{s.value}</p>
                      <p className="text-xs" style={{ color: 'var(--text2)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Account card */}
                <div className="rounded-2xl border p-5" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                  <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>
                    Account Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: user.fullName },
                      { label: 'Email', value: user.email },
                      { label: 'Language', value: LANGUAGES.find((l) => l.value === user.language)?.label ?? user.language },
                      { label: 'Plan', value: user.plan },
                      { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) },
                      { label: 'User ID', value: user._id.slice(-8).toUpperCase() },
                    ].map((row) => (
                      <div key={row.label}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text3)' }}>{row.label}</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent agents */}
                {agents.length > 0 && (
                  <div className="rounded-2xl border p-5" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                    <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>
                      Your Agents
                    </h2>
                    <div className="space-y-3">
                      {agents.slice(0, 4).map((agent) => (
                        <div key={agent._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'var(--accent-lt)' }}>🤖</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{agent.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text2)' }}>{agent.description}</p>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                            style={{
                              background: agent.status === 'deployed' ? 'var(--teal-lt)' : 'var(--bg2)',
                              color: agent.status === 'deployed' ? 'var(--teal)' : 'var(--text3)',
                            }}
                          >
                            {agent.status === 'deployed' ? '● Live' : '○ Draft'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ──────────────── EDIT PROFILE ──────────────── */}
            {tab === 'profile' && (
              <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                <h2 className="font-bold text-base mb-6" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>Edit Profile</h2>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
                        style={{ background: 'var(--accent)' }}
                      >
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatar} alt={fullName} className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        ) : initials(fullName || user.fullName)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAvatarInput(!showAvatarInput)}
                        className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shadow-md"
                        style={{ background: 'var(--accent)' }}
                        aria-label="Change avatar"
                      >✎</button>
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{user.fullName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{user.email}</p>
                      <span
                        className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                        style={{ background: planInfo.bg, color: planInfo.color }}
                      >
                        {planInfo.label} plan
                      </span>
                    </div>
                  </div>

                  {showAvatarInput && (
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }} htmlFor="avatar-url">
                        Avatar URL
                      </label>
                      <input
                        id="avatar-url"
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                        style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full name */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }} htmlFor="p-fullname">
                        FULL NAME
                      </label>
                      <input
                        id="p-fullname" type="text" required value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                        style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>
                        EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <input
                          type="email" value={user.email} readOnly
                          className="w-full px-3 py-2.5 rounded-xl border text-sm pr-9"
                          style={{ borderColor: 'var(--border)', color: 'var(--text3)', background: 'var(--bg2)', cursor: 'not-allowed' }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text3)' }}>🔒</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Email cannot be changed</p>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }} htmlFor="p-lang">
                        PREFERRED LANGUAGE
                      </label>
                      <select
                        id="p-lang" value={language} onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                        style={{ borderColor: 'var(--border2)', color: 'var(--text)', background: '#fff' }}
                      >
                        {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>

                    {/* Plan (read-only display) */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>
                        CURRENT PLAN
                      </label>
                      <div
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}
                      >
                        <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text)' }}>{user.plan}</span>
                        <button
                          type="button"
                          onClick={() => setTab('plan')}
                          className="text-xs font-semibold"
                          style={{ color: 'var(--accent)' }}
                        >
                          Upgrade →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="btn-primary text-sm disabled:opacity-60"
                    >
                      {updateProfile.isPending ? '⏳ Saving…' : '✓ Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ──────────────── SECURITY ──────────────── */}
            {tab === 'security' && (
              <div className="space-y-5">
                {/* Change password */}
                <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                  <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>Change Password</h2>
                  <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>Use a strong password you don't use elsewhere.</p>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {[
                      { label: 'CURRENT PASSWORD', val: currentPwd, set: setCurrentPwd, id: 'cur-pwd' },
                      { label: 'NEW PASSWORD', val: newPwd, set: setNewPwd, id: 'new-pwd' },
                      { label: 'CONFIRM NEW PASSWORD', val: confirmPwd, set: setConfirmPwd, id: 'conf-pwd' },
                    ].map((f) => (
                      <div key={f.id}>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }} htmlFor={f.id}>{f.label}</label>
                        <input
                          id={f.id} type="password" value={f.val}
                          onChange={(e) => f.set(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                          style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                        />
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button type="submit" className="btn-primary text-sm">Update Password</button>
                    </div>
                  </form>
                </div>

                {/* Active session */}
                <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                  <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>Active Sessions</h2>
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--teal-lt)' }}>💻</div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Current session</p>
                        <p className="text-xs" style={{ color: 'var(--text2)' }}>Browser — Active now</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--teal-lt)', color: 'var(--teal)' }}>● Active</span>
                  </div>
                </div>

                {/* Two-factor */}
                <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-base" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>Two-Factor Authentication</h2>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>Add an extra layer of security to your account.</p>
                    </div>
                    <button
                      onClick={() => addToast('2FA coming soon!', 'info')}
                      className="px-4 py-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-gray-50"
                      style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                    >
                      Enable
                    </button>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: '#fca5a5' }}>
                  <h2 className="font-bold text-base mb-1" style={{ color: '#dc2626', fontFamily: 'Syne, sans-serif' }}>Danger Zone</h2>
                  <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
                    Permanently delete your account and all data. This cannot be undone.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>
                        TYPE YOUR EMAIL TO CONFIRM
                      </label>
                      <input
                        type="email" value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder={user.email}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                        style={{ borderColor: '#fca5a5', color: 'var(--text)' }}
                      />
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== user.email || deleting}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                      style={{ background: '#dc2626' }}
                    >
                      {deleting ? '⏳ Deleting…' : '🗑 Delete My Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────── PLAN & BILLING ──────────────── */}
            {tab === 'plan' && (
              <div className="space-y-5">
                {/* Current plan banner */}
                <div
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ background: `linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)` }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {user.plan === 'enterprise' ? '🏢' : user.plan === 'pro' ? '⭐' : '🆓'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/60">CURRENT PLAN</p>
                    <p className="text-xl font-bold text-white capitalize">{user.plan}</p>
                  </div>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      name: 'Free', price: '$0', period: '/month', popular: false,
                      features: ['5 agents', 'Basic tools', 'Community support', '100 messages/day'],
                      current: user.plan === 'free',
                    },
                    {
                      name: 'Pro', price: '$49', period: '/month', popular: true,
                      features: ['Unlimited agents', 'All tools', 'Priority support', 'Unlimited messages', 'Early access'],
                      current: user.plan === 'pro',
                    },
                    {
                      name: 'Enterprise', price: 'Custom', period: '', popular: false,
                      features: ['Everything in Pro', 'SSO & audit logs', 'SLA guarantee', 'Custom fine-tuning', 'Dedicated manager'],
                      current: user.plan === 'enterprise',
                    },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      className="rounded-2xl border p-5 flex flex-col gap-3 relative"
                      style={{
                        background: plan.popular ? 'var(--accent-lt)' : '#fff',
                        borderColor: plan.popular ? 'var(--accent)' : plan.current ? 'var(--teal)' : 'var(--border)',
                      }}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>
                          Most Popular
                        </span>
                      )}
                      {plan.current && (
                        <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--teal-lt)', color: 'var(--teal)' }}>
                          ✓ Current
                        </span>
                      )}
                      <div>
                        <p className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{plan.name}</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                          {plan.price}<span className="text-sm font-normal" style={{ color: 'var(--text2)' }}>{plan.period}</span>
                        </p>
                      </div>
                      <ul className="space-y-1.5 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
                            <span style={{ color: 'var(--teal)' }}>✓</span> {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => plan.current ? addToast('This is your current plan.', 'info') : addToast(`${plan.name} upgrade coming soon!`, 'info')}
                        className="w-full py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                          background: plan.current ? 'var(--bg2)' : plan.popular ? 'var(--accent)' : 'transparent',
                          color: plan.current ? 'var(--text2)' : plan.popular ? '#fff' : 'var(--accent)',
                          border: plan.popular || plan.current ? 'none' : '1px solid var(--accent)',
                        }}
                      >
                        {plan.current ? 'Current plan' : plan.name === 'Enterprise' ? 'Contact sales' : 'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ──────────────── PREFERENCES ──────────────── */}
            {tab === 'preferences' && (
              <div className="space-y-5">
                {/* Theme */}
                <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                  <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>Accent Colour</h2>
                  <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>Choose your preferred theme colour. Resets on page reload.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {PALETTE.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setTheme(p.id)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                        style={{
                          borderColor: theme === p.id ? p.color : 'var(--border)',
                          background: theme === p.id ? `${p.color}10` : '#fff',
                        }}
                      >
                        <div className="w-10 h-10 rounded-full shadow-md" style={{ background: p.color }} />
                        <p className="text-sm font-semibold" style={{ color: theme === p.id ? p.color : 'var(--text)' }}>{p.label}</p>
                        <p className="text-xs text-center" style={{ color: 'var(--text3)' }}>{p.desc}</p>
                        {theme === p.id && (
                          <span className="text-xs font-bold" style={{ color: p.color }}>✓ Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                  <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>Language</h2>
                  <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>Preferred language for the interface.</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.value}
                        onClick={async () => {
                          setLanguage(l.value);
                          try {
                            await updateProfile.mutateAsync({ language: l.value });
                            addToast(`Language set to ${l.label}`, 'success');
                          } catch {
                            addToast('Failed to update language.', 'error');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-all"
                        style={{
                          borderColor: language === l.value ? 'var(--accent)' : 'var(--border)',
                          background: language === l.value ? 'var(--accent-lt)' : '#fff',
                          color: language === l.value ? 'var(--accent)' : 'var(--text2)',
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--border)' }}>
                  <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>Notifications</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Email updates', desc: 'Agent activity reports and weekly digest', val: notifEmails, set: setNotifEmails },
                      { label: 'Product news', desc: 'New features and product announcements', val: notifProduct, set: setNotifProduct },
                    ].map((n) => (
                      <div key={n.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{n.label}</p>
                          <p className="text-xs" style={{ color: 'var(--text2)' }}>{n.desc}</p>
                        </div>
                        <button
                          onClick={() => { n.set(!n.val); addToast(`${n.label} ${!n.val ? 'enabled' : 'disabled'}.`, 'success'); }}
                          className="relative w-11 h-6 rounded-full transition-colors"
                          style={{ background: n.val ? 'var(--accent)' : 'var(--bg3)' }}
                          aria-checked={n.val}
                          role="switch"
                          aria-label={n.label}
                        >
                          <span
                            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                            style={{ left: n.val ? '22px' : '2px' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
