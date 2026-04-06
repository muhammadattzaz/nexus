'use client';
import { useDiscoverPapers } from '@/hooks/useDiscover';
import { RESEARCH_PAPERS } from '@/data/research';
import Link from 'next/link';

const CATEGORY_STYLE: Record<string, { badge: string; bg: string; color: string }> = {
  reasoning:      { badge: '🔬 Reasoning',    bg: '#EBF0FC', color: '#1E4DA8' },
  multimodal:     { badge: '🎯 Multimodal',   bg: '#E2F5EF', color: '#0A5E49' },
  alignment:      { badge: '🛡️ Alignment',    bg: '#FEF2F2', color: '#DC2626' },
  efficiency:     { badge: '⚡ Efficiency',   bg: '#FDF5E0', color: '#8A5A00' },
  'open-weights': { badge: '🔓 Open Weights', bg: '#EBF0FC', color: '#1E4DA8' },
};

export default function TrendingFeed() {
  const { data: apiPapers, isLoading } = useDiscoverPapers();

  const papers = (apiPapers ?? RESEARCH_PAPERS).slice(0, 4);

  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          🔥 Trending This Week
        </h2>
        <Link href="/discover" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent)' }}>
          View research feed →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {papers.map((paper) => {
            const style = CATEGORY_STYLE[paper.category] ?? CATEGORY_STYLE.reasoning;
            return (
              <Link
                key={paper.id}
                href="/discover"
                className="p-5 rounded-2xl border transition-shadow hover:shadow-md cursor-pointer block"
                style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
              >
                <span
                  className="inline-block px-2 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ background: style.bg, color: style.color }}
                >
                  {style.badge}
                </span>
                <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
                  {paper.lab}
                </p>
                <h3
                  className="text-sm font-semibold mb-2 leading-snug"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
                >
                  {paper.title}
                </h3>
                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text2)' }}>
                  {paper.summary}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
