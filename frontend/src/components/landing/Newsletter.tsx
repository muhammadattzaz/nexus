'use client';
import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const { addToast } = useUIStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    addToast('✅ You\'re subscribed! Welcome to NexusAI Weekly.', 'success');
    setEmail('');
  };

  return (
    <section
      className="my-16 rounded-3xl p-10 md:p-16 text-center"
      style={{ background: 'var(--bg2)' }}
    >
      <p
        className="text-sm font-semibold mb-3 uppercase tracking-widest"
        style={{ color: 'var(--accent)' }}
      >
        Stay ahead of the curve
      </p>
      <h2
        className="text-3xl md:text-4xl font-bold mb-4"
        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
      >
        New models drop every week.
        <br />
        Don&apos;t miss a release.
      </h2>
      <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'var(--text2)' }}>
        Get a curated weekly digest: new model releases, benchmark comparisons, pricing
        changes, and prompt engineering tips — straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
          style={{
            background: 'var(--white)',
            borderColor: 'var(--border2)',
            color: 'var(--text)',
          }}
          onFocus={(e) => { e.currentTarget.style.outline = '2px solid var(--accent)'; }}
          aria-label="Email address for newsletter"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: 'var(--accent)' }}
          aria-label="Subscribe to newsletter"
        >
          Subscribe free →
        </button>
      </form>
      <p className="text-xs mt-4" style={{ color: 'var(--text3)' }}>
        No spam. Unsubscribe any time. Trusted by 82K+ builders.
      </p>
    </section>
  );
}
