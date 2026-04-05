import LiveBadge from '@/components/ui/LiveBadge';

export default function HeroSection() {
  return (
    <section className="pt-28 pb-6 px-4 text-center">
      <div className="mb-6 flex justify-center">
        <LiveBadge label="347 models live · Updated daily" color="green" />
      </div>
      <h1
        className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight"
        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
      >
        Find your perfect{' '}
        <span style={{ color: 'var(--accent)' }}>AI model</span>
        <br />
        with guided discovery
      </h1>
      <p
        className="text-lg md:text-xl max-w-2xl mx-auto mb-2"
        style={{ color: 'var(--text2)' }}
      >
        You don&apos;t need to know anything about AI to get started. Just click the
        box below — we&apos;ll do the rest together.{' '}
        <span role="img" aria-label="sparkles">✨</span>
      </p>
    </section>
  );
}
