'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMarketplace } from '@/hooks/useMarketplace';

const PROVIDER_META: Record<string, { emoji: string; tagline: string }> = {
  OpenAI:              { emoji: '🧠', tagline: 'GPT-5, o3, Sora' },
  Anthropic:           { emoji: '⚡', tagline: 'Opus, Sonnet, Haiku' },
  'Google DeepMind':   { emoji: '🔬', tagline: 'Gemini 3.1, Veo 3' },
  Google:              { emoji: '🔬', tagline: 'Gemini, PaLM' },
  xAI:                 { emoji: '𝕏',  tagline: 'Grok-4, Grok-Imagine' },
  DeepSeek:            { emoji: '💻', tagline: 'V3, R1, V3.2' },
  Meta:                { emoji: '🦙', tagline: 'Llama 4, Maverick' },
  Alibaba:             { emoji: '🀄', tagline: 'Qwen3-Max, Coder' },
  'Mistral AI':        { emoji: '🌀', tagline: 'Devstral, Medium 3' },
  Microsoft:           { emoji: '🪟', tagline: 'Phi-4, Azure AI' },
  Cohere:              { emoji: '🔵', tagline: 'Command R+, Embed' },
  Amazon:              { emoji: '📦', tagline: 'Titan, Nova' },
  Perplexity:          { emoji: '🔍', tagline: 'Sonar, Online' },
  'Stability AI':      { emoji: '🎨', tagline: 'SD 3.5, Stable Video' },
  'Black Forest Labs': { emoji: '🌲', tagline: 'FLUX.1, FLUX Pro' },
  'Hugging Face':      { emoji: '🤗', tagline: 'Open models hub' },
  Databricks:          { emoji: '🧱', tagline: 'DBRX, Dolly' },
  Baidu:               { emoji: '🐉', tagline: 'ERNIE 4.0' },
  Writer:              { emoji: '✍️', tagline: 'Palmyra X, Vision' },
};

export default function LabsBrowser() {
  const router = useRouter();
  const { data: allData, isLoading } = useMarketplace();

  const labs = useMemo(() => {
    if (!allData) return [];
    const counts: Record<string, number> = {};
    for (const m of allData) {
      counts[m.provider] = (counts[m.provider] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        const meta = PROVIDER_META[name];
        return {
          name,
          count,
          emoji: meta?.emoji ?? '🤖',
          tagline: meta?.tagline ?? '',
        };
      });
  }, [allData]);

  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          Browse by AI Lab
        </h2>
        <a
          href="/marketplace"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          See all labs →
        </a>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ background: 'var(--bg2)' }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {labs.map((lab) => (
            <button
              key={lab.name}
              onClick={() => router.push(`/marketplace?provider=${encodeURIComponent(lab.name)}`)}
              className="p-4 rounded-2xl border text-center transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
              style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-3"
                style={{ background: 'var(--bg2)' }}
              >
                {lab.emoji}
              </div>
              <p
                className="text-xs font-semibold mb-1 leading-tight"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
              >
                {lab.name}
              </p>
              {lab.tagline && (
                <p
                  className="text-[10px] mb-1.5 leading-tight line-clamp-1"
                  style={{ color: 'var(--text3)' }}
                >
                  {lab.tagline}
                </p>
              )}
              <p
                className="text-xs font-medium"
                style={{ color: 'var(--accent)' }}
              >
                {lab.count} model{lab.count !== 1 ? 's' : ''}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
