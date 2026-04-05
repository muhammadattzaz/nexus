'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import UserProfileModal from '@/components/ui/UserProfileModal';

const TABS = [
  { label: '💬 Chat Hub', href: '/chathub' },
  { label: '🛍 Marketplace', href: '/marketplace' },
  { label: '🤖 Agents', href: '/agents' },
  { label: '🔬 Discover New', href: '/discover' },
];

export default function AppNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const logout = useLogout();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="NexusAI home">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,14 14,18" fill="#C8622A" />
              <polygon points="14,2 2,14 14,18" fill="#A34D1E" />
              <polygon points="14,18 26,14 14,26" fill="#FDF1EB" stroke="#C8622A" strokeWidth="0.5" />
              <polygon points="14,18 2,14 14,26" fill="#F4E4D8" stroke="#C8622A" strokeWidth="0.5" />
            </svg>
            <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
              NexusAI
            </span>
          </Link>

          {/* Center tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors relative',
                    isActive ? 'text-[#C8622A]' : 'hover:bg-[#F4F2EE]'
                  )}
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text2)' }}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors hover:bg-[#F4F2EE]"
                  style={{ borderColor: 'var(--border)' }}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                    style={{ background: 'var(--accent)' }}
                  >
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text)' }}>
                    {user.fullName.split(' ')[0]}
                  </span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-lg border overflow-hidden z-50"
                    style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{user.fullName}</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{user.email}</p>
                    </div>

                    <button
                      onClick={() => { setProfileOpen(true); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#F4F2EE] transition-colors"
                      style={{ color: 'var(--text)' }}
                    >
                      👤 Profile
                    </button>

                    <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => { logout.mutate(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#F4F2EE] transition-colors"
                        style={{ color: 'var(--rose)' }}
                      >
                        🚪 Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-3 py-1.5 text-sm font-medium border rounded-xl hover:bg-[#F4F2EE] transition-colors"
                  style={{ color: 'var(--text)', borderColor: 'var(--border2)' }}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--accent)' }}
                >
                  Try free →
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
