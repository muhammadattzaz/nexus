'use client';
import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';

const TABS = [
  {
    label: 'Recruiting',
    suggestions: [
      'Find the best AI to screen resumes and rank candidates',
      'What AI model handles structured job description generation?',
      'Help me build an AI interview assistant for technical roles',
      'Which model works best for HR email automation?',
    ],
  },
  {
    label: 'Create a prototype',
    suggestions: [
      'Build a working app prototype from a description',
      'Generate a UI wireframe and component code',
      'Create a functional API prototype in under 10 minutes',
      'Which AI is best for rapid prototyping with code generation?',
    ],
  },
  {
    label: 'Build a business',
    suggestions: [
      'Create a full business plan with financial projections',
      'Generate a pitch deck for a SaaS startup',
      'Which AI model is best for market research analysis?',
      'Help me build an automated customer support system',
    ],
  },
  {
    label: 'Help me learn',
    suggestions: [
      'Create a personalized study plan for machine learning',
      'Explain neural networks as if I\'m 12 years old',
      'Which AI models are best for tutoring and Q&A?',
      'Generate a quiz on Python fundamentals',
    ],
  },
  {
    label: 'Research',
    suggestions: [
      'Summarize the latest breakthroughs in LLM research',
      'Compare the performance of GPT-5 vs Claude Opus 4.6',
      'What are the best open-source models for research?',
      'Find papers on AI alignment published in 2026',
    ],
  },
];

export default function SuggestedQuestions() {
  const [activeTab, setActiveTab] = useState(0);
  const { addToast } = useUIStore();

  const handleSuggestion = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    addToast('💡 Suggestion copied — paste it in the search box!', 'info');
  };

  return (
    <section className="my-8">
      <p className="text-xs text-center mb-3" style={{ color: 'var(--text3)' }}>
        Click any suggestion to fill the search box, then press Let&apos;s go
      </p>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeTab === i ? 'var(--accent)' : 'var(--white)',
              color: activeTab === i ? 'white' : 'var(--text2)',
              border: `1px solid ${activeTab === i ? 'var(--accent)' : 'var(--border2)'}`,
            }}
            aria-label={`${tab.label} suggestions`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center">
        {TABS[activeTab].suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestion(suggestion)}
            className="px-4 py-2 rounded-xl border text-sm transition-all hover:shadow-sm text-left"
            style={{
              background: 'var(--white)',
              borderColor: 'var(--border)',
              color: 'var(--text2)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)';
            }}
            aria-label={suggestion}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
