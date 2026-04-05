const FEATURES = [
  {
    icon: '🧭',
    title: 'Guided Discovery Chat',
    description:
      "I'll greet you, ask about your goals, and have a genuine conversation before recommending models. No overwhelming lists.",
    color: '#EBF0FC',
    iconColor: '#1E4DA8',
  },
  {
    icon: '📐',
    title: 'Prompt Engineering Guide',
    description:
      'Every model includes tailored prompt templates, principles, and examples so you get the best output from day one.',
    color: '#FDF1EB',
    iconColor: '#C8622A',
  },
  {
    icon: '🤖',
    title: 'Agent Builder',
    description:
      'Step-by-step agent creation guides for every model — system prompts, tool configuration, memory setup, deployment.',
    color: '#E2F5EF',
    iconColor: '#0A5E49',
  },
  {
    icon: '💰',
    title: 'Flexible Pricing',
    description:
      'Free tiers, pay-per-use, subscriptions, and enterprise plans. Transparent pricing with no hidden fees.',
    color: '#FDF5E0',
    iconColor: '#8A5A00',
  },
  {
    icon: '⭐',
    title: 'User Reviews & Ratings',
    description:
      'Verified reviews from real builders, benchmark scores, and detailed I/O specs to help you choose confidently.',
    color: '#FDF1EB',
    iconColor: '#C8622A',
  },
  {
    icon: '🔬',
    title: 'Research Feed',
    description:
      'Daily curated AI research, model releases, and breakthroughs from top labs — stay ahead of the curve.',
    color: '#EBF0FC',
    iconColor: '#1E4DA8',
  },
];

export default function FeatureCards() {
  return (
    <section className="my-16">
      <h2
        className="text-3xl font-bold text-center mb-10"
        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
      >
        Built for every builder
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="p-6 rounded-2xl border transition-shadow hover:shadow-md"
            style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
              style={{ background: feature.color }}
            >
              {feature.icon}
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
            >
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
