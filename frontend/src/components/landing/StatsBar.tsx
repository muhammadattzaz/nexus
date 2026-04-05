const STATS = [
  { value: '525+', label: 'AI Models' },
  { value: '82K', label: 'Builders' },
  { value: '28', label: 'AI Labs' },
  { value: '4.8⭐', label: 'Avg Rating' },
];

export default function StatsBar() {
  return (
    <div
      className="flex flex-wrap justify-center items-center gap-0 rounded-2xl border overflow-hidden my-12"
      style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
    >
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex-1 min-w-[140px] px-8 py-6 text-center ${i < STATS.length - 1 ? 'border-r' : ''}`}
          style={{ borderColor: 'var(--border)' }}
        >
          <p
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent)' }}
          >
            {stat.value}
          </p>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
