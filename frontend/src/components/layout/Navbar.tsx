'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ur', label: 'اردو' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ru', label: 'Русский' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
];

const NAV_LINKS = [
  { label: 'Chat Hub', href: '/chathub' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Discover New', href: '/discover' },
  { label: 'Agents', href: '/agents' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'shadow-md'
          : ''
      )}
      style={{
        background: scrolled ? 'rgba(244,242,238,0.96)' : 'var(--bg)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="NexusAI home">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,14 14,18" fill="#C8622A" />
            <polygon points="14,2 2,14 14,18" fill="#A34D1E" />
            <polygon points="14,18 26,14 14,26" fill="#FDF1EB" stroke="#C8622A" strokeWidth="0.5" />
            <polygon points="14,18 2,14 14,26" fill="#F4E4D8" stroke="#C8622A" strokeWidth="0.5" />
          </svg>
          <span
            className="text-xl font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
          >
            NexusAI
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[#C8622A]"
              style={{ color: 'var(--text2)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-[#ECEAE4]"
              style={{ color: 'var(--text2)' }}
              aria-label="Select language"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {selectedLang}
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {langOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-lg border overflow-hidden z-50"
                style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang.code.toUpperCase()); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#F4F2EE] transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/signin"
            className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-[#ECEAE4]"
            style={{ color: 'var(--text)', borderColor: 'var(--border2)' }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Get Started →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
          style={{ color: 'var(--text)' }}
        >
          {mobileOpen ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-4 flex flex-col gap-3"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm font-medium"
              style={{ color: 'var(--text2)' }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/signin" className="flex-1 py-2 text-center text-sm font-medium border rounded-xl" style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}>Sign in</Link>
            <Link href="/signup" className="flex-1 py-2 text-center text-sm font-semibold text-white rounded-xl" style={{ background: 'var(--accent)' }}>Get Started →</Link>
          </div>
        </div>
      )}
    </header>
  );
}
