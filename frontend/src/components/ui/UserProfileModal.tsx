'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile, UpdateProfilePayload } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ open, onClose }: Props) {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const { addToast } = useUIStore();

  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [language, setLanguage] = useState('en');

  // Sync local state when user changes (e.g. after a successful update)
  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? '');
      setAvatar(user.avatar ?? '');
      setLanguage(user.language ?? 'en');
    }
  }, [user]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateProfilePayload = {};
    if (fullName.trim() && fullName.trim() !== user?.fullName) payload.fullName = fullName.trim();
    if (avatar.trim() !== (user?.avatar ?? '')) payload.avatar = avatar.trim() || undefined;
    if (language !== user?.language) payload.language = language;

    if (Object.keys(payload).length === 0) {
      addToast('No changes to save.', 'info');
      return;
    }

    try {
      await updateProfile.mutateAsync(payload);
      addToast('Profile updated successfully.', 'success');
      onClose();
    } catch {
      addToast('Failed to update profile. Please try again.', 'error');
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-md rounded-2xl border shadow-xl"
          style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 id="profile-modal-title" className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F2EE] transition-colors"
              style={{ color: 'var(--text2)' }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0 overflow-hidden"
                style={{ background: 'var(--accent)' }}
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt={fullName} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }} htmlFor="profile-avatar">
                  Avatar URL
                </label>
                <input
                  id="profile-avatar"
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                />
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }} htmlFor="profile-name">
                Full name
              </label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                Email address
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full px-3 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: 'var(--border2)', color: 'var(--text3)', background: 'var(--bg2)', cursor: 'not-allowed' }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--text3)' }}>Email cannot be changed.</p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }} htmlFor="profile-language">
                Preferred language
              </label>
              <select
                id="profile-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--border2)', color: 'var(--text)', background: 'var(--white)' }}
              >
                {[
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'zh', label: 'Chinese' },
                  { value: 'ja', label: 'Japanese' },
                  { value: 'ar', label: 'Arabic' },
                ].map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Plan badge (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                Plan
              </label>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
                style={{
                  background: user?.plan === 'pro' ? '#FFF3E0' : user?.plan === 'enterprise' ? '#E8F5E9' : '#F4F2EE',
                  color: user?.plan === 'pro' ? '#E65100' : user?.plan === 'enterprise' ? '#1B5E20' : 'var(--text2)',
                }}
              >
                {user?.plan ?? 'free'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-xl border transition-colors hover:bg-[#F4F2EE]"
                style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--accent)' }}
              >
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
