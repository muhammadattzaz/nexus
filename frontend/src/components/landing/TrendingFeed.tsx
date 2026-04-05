const TRENDS = [
  {
    badge: '🆕 Just Released',
    badgeBg: '#E2F5EF',
    badgeColor: '#0A5E49',
    lab: 'Anthropic',
    title: 'Claude Opus 4.6 & Sonnet 4.6',
    excerpt:
      'Adaptive Thinking and 1M token context (beta) mark a major leap in agent capability.',
  },
  {
    badge: '🔥 Hot',
    badgeBg: '#FEF2F2',
    badgeColor: '#DC2626',
    lab: 'Google DeepMind',
    title: 'Gemini 3.1 Pro — Thought Signatures',
    excerpt:
      'Thought Signatures bring new transparency to deep reasoning. 5M context window crushes previous records.',
  },
  {
    badge: '🤖 Agent Use',
    badgeBg: '#EBF0FC',
    badgeColor: '#1E4DA8',
    lab: 'OpenAI',
    title: 'GPT-5.4 — Native agent use',
    excerpt:
      'GPT-5.4 introduces native agent use, letting it operate browsers, apps, and files autonomously.',
  },
  {
    badge: '⚡ Real-Time',
    badgeBg: '#FDF5E0',
    badgeColor: '#8A5A00',
    lab: 'xAI',
    title: 'Grok-4-1 Fast — 4-Agent Architecture',
    excerpt:
      "Grok's 4-agent architecture with real-time X (Twitter) data access and 2M context window.",
  },
];

export default function TrendingFeed() {
  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          🔥 Trending This Week
        </h2>
        <a
          href="/discover"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          View research feed →
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRENDS.map((trend) => (
          <div
            key={trend.title}
            className="p-5 rounded-2xl border transition-shadow hover:shadow-md cursor-pointer"
            style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
          >
            <span
              className="inline-block px-2 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: trend.badgeBg, color: trend.badgeColor }}
            >
              {trend.badge}
            </span>
            <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
              {trend.lab}
            </p>
            <h3
              className="text-sm font-semibold mb-2 leading-snug"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
            >
              {trend.title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
              {trend.excerpt}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
