export interface ResearchPaper {
  id: string;
  title: string;
  summary: string;
  lab: string;
  category: 'reasoning' | 'multimodal' | 'alignment' | 'efficiency' | 'open-weights';
  publishedAt: string;
  stats: { label: string; value: string }[];
  models: string[];
  discussPrompt: string;
}

export const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: '1',
    title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks',
    summary:
      'Scores 83.2% on AIME 2025 math competition, outperforming all prior models on reasoning-intensive tasks using Iterative Thought Refinement.',
    lab: 'Google DeepMind',
    category: 'reasoning',
    publishedAt: '2026-03-26',
    stats: [
      { label: 'AIME 2025 score', value: '83.2%' },
      { label: 'vs prior SOTA', value: '+6.4%' },
      { label: 'Context', value: '5M' },
    ],
    models: ['Gemini 2.5 Pro', 'GPT-5', 'Claude Opus 4.6', 'o3'],
    discussPrompt: 'Explain how Gemini 2.5 Pro achieves 83.2% on AIME 2025',
  },
  {
    id: '2',
    title: 'Scaling laws for multimodal models: new empirical findings',
    summary:
      'Research reveals unexpected scaling dynamics when combining vision and language, showing a 31% efficiency gap compared to unimodal models at 70-100B parameter scale.',
    lab: 'MIT CSAIL',
    category: 'multimodal',
    publishedAt: '2026-03-22',
    stats: [
      { label: 'Plateau point', value: '70-100B' },
      { label: 'Efficiency gap', value: '31%' },
      { label: 'Models tested', value: '12' },
    ],
    models: ['Gemini 3.1 Pro', 'GPT-5', 'Llama 4 Maverick', 'Qwen3-Max'],
    discussPrompt:
      'What are the key scaling law differences between multimodal and unimodal models?',
  },
  {
    id: '3',
    title: 'Constitutional AI v2: improved alignment through iterative refinement',
    summary:
      'New methodology achieves 40% reduction in harmful outputs while preserving 99.5% of general capability through iterative constitutional refinement.',
    lab: 'Anthropic',
    category: 'alignment',
    publishedAt: '2026-03-18',
    stats: [
      { label: 'Harmful output reduction', value: '-40%' },
      { label: 'Capability drop', value: '<0.5%' },
      { label: 'Constitution', value: 'v2.0' },
    ],
    models: ['Claude Opus 4.6', 'Claude Haiku 4.5', 'Claude Sonnet 4.6'],
    discussPrompt:
      'Explain Constitutional AI v2 and how iterative refinement reduces harmful outputs',
  },
  {
    id: '4',
    title: 'Llama 4 Scout & Maverick: natively multimodal from the ground up',
    summary:
      '17B MoE architecture trained on 40 trillion tokens with native understanding across text, image, and video in 119 languages.',
    lab: 'Meta AI',
    category: 'open-weights',
    publishedAt: '2026-03-15',
    stats: [
      { label: 'Maverick params', value: '400B' },
      { label: 'Languages', value: '119' },
      { label: 'Training tokens', value: '40T' },
    ],
    models: ['Llama 4 Maverick', 'Llama 4 Scout', 'GPT-4o', 'Claude Sonnet 4.6'],
    discussPrompt:
      "How does Llama 4 Maverick's 400B MoE architecture compare to dense models?",
  },
  {
    id: '5',
    title: 'Long-context recall: how models handle 1M+ token windows',
    summary:
      'Comprehensive evaluation of 14 models shows sharp recall degradation beyond 200K tokens. Only Kimi-k2.5 and GLM-5 maintain above 70% recall at 1M tokens.',
    lab: 'Stanford NLP',
    category: 'efficiency',
    publishedAt: '2026-03-10',
    stats: [
      { label: 'Recall at 1M tok', value: '34% avg' },
      { label: 'Recall at 100K', value: '91% avg' },
      { label: 'Models tested', value: '14' },
    ],
    models: ['Kimi K2.5', 'GLM-5', 'Claude Opus 4.6', 'Gemini 3.1 Pro'],
    discussPrompt: 'Why do most models lose recall accuracy beyond 200K tokens?',
  },
];
