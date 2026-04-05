'use client';

import { useState } from 'react';
import AppNav from '@/components/layout/AppNav';
import Footer from '@/components/layout/Footer';
import LiveBadge from '@/components/ui/LiveBadge';
import { useUIStore } from '@/store/uiStore';
import { useDiscoverPapers, ApiPaper } from '@/hooks/useDiscover';
import Link from 'next/link';

type Category = 'all' | 'reasoning' | 'multimodal' | 'alignment' | 'efficiency' | 'open-weights';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'reasoning', label: '🧠 Reasoning' },
  { id: 'multimodal', label: '🌐 Multimodal' },
  { id: 'alignment', label: '🛡️ Alignment' },
  { id: 'efficiency', label: '⚡ Efficiency' },
  { id: 'open-weights', label: '🔓 Open Weights' },
];

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedPaper, setSelectedPaper] = useState<ApiPaper | null>(null);
  const { addToast } = useUIStore();

  const { data: papers = [], isLoading } = useDiscoverPapers(activeCategory);

  const filtered = papers;

  const handleSave = () => addToast('🔖 Paper saved to your library!', 'success');
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => undefined);
    addToast('🔗 Link copied to clipboard!', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--bg)' }}>
      <AppNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
            >
              AI Research Feed
            </h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Curated breakthroughs · Updated daily
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveBadge label="6 papers this week" color="teal" />
            <button
              onClick={() => addToast('🔔 Subscribed to research alerts!', 'success')}
              className="btn-ghost text-sm px-3 py-2"
            >
              🔔 Subscribe
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: activeCategory === cat.id ? 'var(--accent)' : '#fff',
                color: activeCategory === cat.id ? '#fff' : 'var(--text2)',
                border: '1px solid',
                borderColor: activeCategory === cat.id ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Split layout */}
        <div className="flex gap-6 flex-1 min-h-0">
          {/* LEFT: Paper list */}
          <div className="flex-1 space-y-3 overflow-y-auto">
            {isLoading && (
              <div className="text-center py-10 text-sm animate-pulse" style={{ color: 'var(--text2)' }}>
                Loading research papers…
              </div>
            )}
            {filtered.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                isActive={selectedPaper?.id === paper.id}
                onClick={() => setSelectedPaper(paper)}
              />
            ))}
          </div>

          {/* RIGHT: Detail panel */}
          <aside
            className="hidden lg:flex flex-col rounded-2xl border overflow-hidden"
            style={{ width: 360, background: '#fff', borderColor: 'var(--border)' }}
          >
            {selectedPaper ? (
              <div className="flex flex-col h-full overflow-y-auto p-5">
                {/* Lab + date */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'var(--teal-lt)', color: 'var(--teal)' }}
                  >
                    {selectedPaper.lab}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>
                    {new Date(selectedPaper.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h2
                  className="text-lg font-bold mb-3 leading-snug"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
                >
                  {selectedPaper.title}
                </h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text2)' }}>
                  {selectedPaper.summary}
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {selectedPaper.stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl p-2.5 text-center border"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                    >
                      <p
                        className="text-base font-bold"
                        style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}
                      >
                        {s.value}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text2)' }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Models discussed */}
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>
                    Models discussed
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPaper.models.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: 'var(--blue-lt)', color: 'var(--blue)' }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-auto">
                  <Link
                    href={`/chathub?prompt=${encodeURIComponent(selectedPaper.discussPrompt)}`}
                    className="btn-primary justify-center"
                  >
                    💬 Discuss in Chat Hub
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-ghost flex-1 justify-center text-sm py-2">
                      🔖 Save
                    </button>
                    <button onClick={handleShare} className="btn-ghost flex-1 justify-center text-sm py-2">
                      🔗 Share
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <span className="text-5xl mb-4" aria-hidden="true">🔬</span>
                <p className="font-semibold text-base mb-1" style={{ color: 'var(--text)' }}>
                  Select a paper
                </p>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  Click a paper on the left to see the full details, stats, and discussion options.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function PaperCard({
  paper,
  isActive,
  onClick,
}: {
  paper: ApiPaper;
  isActive: boolean;
  onClick: () => void;
}) {
  const catColors: Record<ApiPaper['category'], { bg: string; color: string }> = {
    reasoning: { bg: 'var(--amber-lt)', color: 'var(--amber)' },
    multimodal: { bg: 'var(--blue-lt)', color: 'var(--blue)' },
    alignment: { bg: 'var(--teal-lt)', color: 'var(--teal)' },
    efficiency: { bg: 'var(--accent-lt)', color: 'var(--accent)' },
    'open-weights': { bg: '#EBF0FC', color: '#1E4DA8' },
  };
  const c = catColors[paper.category];

  return (
    <article
      onClick={onClick}
      className="rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md"
      style={{
        background: '#fff',
        borderColor: isActive ? 'var(--accent)' : 'var(--border)',
        borderWidth: isActive ? 2 : 1,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: 'var(--teal-lt)', color: 'var(--teal)' }}
        >
          {paper.lab}
        </span>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
          style={{ background: c.bg, color: c.color }}
        >
          {paper.category.replace('-', ' ')}
        </span>
        <span className="text-xs ml-auto" style={{ color: 'var(--text3)' }}>
          {new Date(paper.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <h3
        className="font-bold text-sm mb-1.5 leading-snug"
        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
      >
        {paper.title}
      </h3>
      <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--text2)' }}>
        {paper.summary}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {paper.stats.map((s) => (
          <span
            key={s.label}
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
          >
            {s.label}: {s.value}
          </span>
        ))}
      </div>
    </article>
  );
}
