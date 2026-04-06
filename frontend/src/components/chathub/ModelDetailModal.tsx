'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { MODELS } from '@/data/models';

type Tab = 'overview' | 'how-to-use' | 'pricing' | 'prompt-guide' | 'agent-creation' | 'reviews';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-to-use', label: 'How to Use' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'prompt-guide', label: 'Prompt Guide' },
  { id: 'agent-creation', label: 'Agent Creation' },
  { id: 'reviews', label: 'Reviews' },
];

const SAMPLE_REVIEWS = [
  {
    name: 'Sarah K.',
    role: 'ML Engineer at Stripe',
    rating: 5,
    text: 'Incredible reasoning capability. Handles complex multi-step coding tasks that I previously had to break down manually. The context window is a game-changer for large codebases.',
  },
  {
    name: 'Ravi M.',
    role: 'Product Manager at Notion',
    rating: 5,
    text: 'The best model for writing tasks by a mile. Understands nuance, tone, and audience better than any other model I\'ve tried. My team saves 3 hours per week.',
  },
  {
    name: 'Priya L.',
    role: 'Founder, DataFlow',
    rating: 4,
    text: 'Great for data analysis pipelines. Occasionally hallucinates on very niche domain knowledge but is excellent at structured output and JSON generation.',
  },
];

export default function ModelDetailModal() {
  const { modelDetailModal, closeModelDetail, addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Sync to initialTab whenever the modal opens or the requested tab changes
  useEffect(() => {
    if (modelDetailModal.open && modelDetailModal.initialTab) {
      setActiveTab(modelDetailModal.initialTab as Tab);
    }
  }, [modelDetailModal.open, modelDetailModal.modelId, modelDetailModal.initialTab]);

  if (!modelDetailModal.open || !modelDetailModal.modelId) return null;

  const model = MODELS.find((m) => m.id === modelDetailModal.modelId);
  if (!model) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeModelDetail(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`${model.name} details`}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ background: '#fff' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--accent-lt)' }}
              aria-hidden="true"
            >
              {model.emoji}
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
                {model.name}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>{model.provider}</p>
            </div>
          </div>
          <button
            onClick={closeModelDetail}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text2)' }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b" style={{ borderColor: 'var(--border)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative"
              style={{ color: activeTab === tab.id ? 'var(--accent)' : 'var(--text2)' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab model={model} />
          )}
          {activeTab === 'how-to-use' && (
            <HowToUseTab model={model} />
          )}
          {activeTab === 'pricing' && (
            <PricingTab model={model} addToast={addToast} />
          )}
          {activeTab === 'prompt-guide' && (
            <PromptGuideTab model={model} />
          )}
          {activeTab === 'agent-creation' && (
            <AgentCreationTab model={model} />
          )}
          {activeTab === 'reviews' && (
            <ReviewsTab />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ model }: { model: (typeof MODELS)[0] }) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{model.description}</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Context Window', value: model.contextWindow },
          { label: 'Max Output', value: '4K tokens' },
          { label: 'Latency', value: model.tags.includes('Fast') ? '~0.5s' : '~2s' },
        ].map((spec) => (
          <div key={spec.label} className="rounded-xl p-3 text-center border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text2)' }}>{spec.label}</p>
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{spec.value}</p>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>Use Cases</h3>
        <div className="flex flex-wrap gap-2">
          {model.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--blue-lt)', color: 'var(--blue)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>Example Prompt</h3>
        <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--bg2)', color: 'var(--text2)', fontFamily: 'monospace' }}>
          &ldquo;Analyse the attached dataset and provide insights on the key trends, outliers, and actionable recommendations.&rdquo;
        </div>
      </div>
    </div>
  );
}

function HowToUseTab({ model }: { model: (typeof MODELS)[0] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Getting started with {model.name}</h3>
      <ol className="space-y-3">
        {[
          'Select the model from the sidebar or marketplace.',
          'Type your prompt in the chat input or upload a file.',
          'Adjust temperature and max tokens in the settings panel.',
          'Click Send and review the response.',
          'Iterate by refining your prompt or providing feedback.',
        ].map((step, i) => (
          <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--text2)' }}>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function PricingTab({ model, addToast }: { model: (typeof MODELS)[0]; addToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const tiers = [
    {
      name: 'Pay-per-use',
      price: `$${model.pricing.inputPer1M}/1M input`,
      output: `${model.pricing.outputPer1M}/1M output`,
      features: ['Standard support', 'No minimum spend', 'All regions'],
      popular: false,
    },
    {
      name: '🌟 Pro Subscription',
      price: '$49/month',
      output: 'Priority support',
      features: ['10x faster responses', 'Priority queue', 'Early access', 'Usage dashboard'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom pricing',
      output: 'Volume discounts',
      features: ['SLA guarantee', 'Dedicated support', 'Custom fine-tuning', 'SSO & audit logs'],
      popular: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className="rounded-xl border p-4 flex flex-col gap-3"
          style={{
            borderColor: tier.popular ? 'var(--accent)' : 'var(--border)',
            background: tier.popular ? 'var(--accent-lt)' : '#fff',
          }}
        >
          {tier.popular && (
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Most Popular</span>
          )}
          <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{tier.name}</h3>
          <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{tier.price}</p>
          <p className="text-xs" style={{ color: 'var(--text2)' }}>{tier.output}</p>
          <ul className="space-y-1 flex-1">
            {tier.features.map((f) => (
              <li key={f} className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text2)' }}>
                <span style={{ color: 'var(--teal)' }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => addToast('🚀 Plan selected!', 'success')}
            className="w-full py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: tier.popular ? 'var(--accent)' : 'transparent',
              color: tier.popular ? '#fff' : 'var(--accent)',
              border: tier.popular ? 'none' : '1px solid var(--accent)',
            }}
          >
            {tier.name === 'Enterprise' ? 'Contact sales' : 'Get started'}
          </button>
        </div>
      ))}
    </div>
  );
}

function PromptGuideTab({ model }: { model: (typeof MODELS)[0] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Prompt Engineering for {model.name}</h3>
      {[
        { tip: 'Be specific', desc: 'Provide clear context, format expectations, and constraints in your prompt.' },
        { tip: 'Use examples', desc: 'Include 1-2 examples of the desired output to guide the model.' },
        { tip: 'Set the role', desc: 'Start with "You are a [role]…" to anchor the model\'s behavior.' },
        { tip: 'Iterate', desc: 'Refine based on the output — small tweaks often yield major improvements.' },
      ].map((item) => (
        <div key={item.tip} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
          <span className="text-lg" aria-hidden="true">💡</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.tip}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentCreationTab({ model }: { model: (typeof MODELS)[0] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Create an Agent with {model.name}</h3>
      <p className="text-sm" style={{ color: 'var(--text2)' }}>
        Build a custom AI agent using {model.name} as the backbone. Configure tools, memory, and personality to automate complex tasks.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {['Web Search', 'Code Execution', 'File I/O', 'Email', 'Calendar', 'Database'].map((tool) => (
          <label key={tool} className="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
            <input type="checkbox" className="accent-accent" />
            <span className="text-sm" style={{ color: 'var(--text)' }}>{tool}</span>
          </label>
        ))}
      </div>
      <button className="btn-primary w-full justify-center">Create Agent →</button>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="space-y-5">
      {/* Overall rating */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>4.7</p>
          <p className="text-xs" style={{ color: 'var(--text2)' }}>2,847 reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {[
            { stars: 5, pct: 72 },
            { stars: 4, pct: 20 },
            { stars: 3, pct: 6 },
            { stars: 2, pct: 1 },
            { stars: 1, pct: 1 },
          ].map((row) => (
            <div key={row.stars} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
              <span className="w-4">{row.stars}★</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg2)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${row.pct}%`, background: 'var(--accent)' }}
                />
              </div>
              <span className="w-8">{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sample reviews */}
      {SAMPLE_REVIEWS.map((review) => (
        <div key={review.name} className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{review.name}</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>{review.role}</p>
            </div>
            <span className="text-sm" style={{ color: 'var(--accent)' }}>{'★'.repeat(review.rating)}</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{review.text}</p>
        </div>
      ))}
    </div>
  );
}
