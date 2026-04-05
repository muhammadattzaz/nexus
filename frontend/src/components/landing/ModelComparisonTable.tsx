import { MODELS } from '@/data/models';

const FLAGSHIP_IDS = ['gpt-5', 'claude-opus-4-6', 'gemini-3-1-pro', 'o3', 'grok-4', 'llama-4-maverick', 'deepseek-r1', 'mistral-large-3'];

export default function ModelComparisonTable() {
  const flagships = MODELS.filter((m) => FLAGSHIP_IDS.includes(m.id));

  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
          >
            Flagship Model Comparison
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Side-by-side view of the leading models. Input/Output prices per 1M tokens.
          </p>
        </div>
        <a href="/marketplace" className="text-sm font-medium hover:underline flex-shrink-0" style={{ color: 'var(--accent)' }}>
          Compare all →
        </a>
      </div>
      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
              {['Model', 'Lab', 'Context', 'Input $/1M', 'Output $/1M', 'Best For'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text2)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flagships.map((model, i) => (
              <tr
                key={model.id}
                className="transition-colors hover:bg-[#F4F2EE]"
                style={{
                  background: i % 2 === 0 ? 'var(--white)' : 'var(--bg)',
                  borderBottom: i < flagships.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{model.emoji}</span>
                    <span className="font-medium" style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>
                      {model.name}
                    </span>
                    {model.badge && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{
                          background: model.badge === 'hot' ? '#FEF2F2' : model.badge === 'new' ? '#E2F5EF' : '#EBF0FC',
                          color: model.badge === 'hot' ? '#DC2626' : model.badge === 'new' ? '#0A5E49' : '#1E4DA8',
                        }}
                      >
                        {model.badge === 'hot' ? '🔥' : model.badge === 'new' ? '✨' : '🔓'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>{model.provider}</td>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text2)' }}>{model.contextWindow}</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--teal)' }}>
                  {model.pricing.inputPer1M === 0 ? 'Free' : `$${model.pricing.inputPer1M}`}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>
                  {model.pricing.outputPer1M}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {model.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
        * Prices shown are approximate. Free self-hosted models exclude infrastructure costs. Beta pricing may change.
      </p>
    </section>
  );
}
