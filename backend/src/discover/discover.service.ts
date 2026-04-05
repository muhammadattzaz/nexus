import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Paper, PaperDocument } from './schemas/paper.schema';

interface StaticPaper {
  id: string;
  title: string;
  summary: string;
  lab: string;
  category: string;
  publishedAt: string;
  stats: { label: string; value: string }[];
  models: string[];
  discussPrompt: string;
}

const STATIC_PAPERS: StaticPaper[] = [
  {
    id: 'gemini-2-5-pro-aime',
    title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks',
    summary: 'Scores 83.2% on AIME 2025 math competition, outperforming all prior models on reasoning-intensive tasks using Iterative Thought Refinement.',
    lab: 'Google DeepMind',
    category: 'reasoning',
    publishedAt: '2026-03-26',
    stats: [
      { label: 'AIME 2025 score', value: '83.2%' },
      { label: 'vs prior SOTA', value: '+6.4%' },
      { label: 'Context window', value: '5M' },
    ],
    models: ['Gemini 2.5 Pro', 'GPT-5', 'Claude Opus 4.6', 'o3'],
    discussPrompt: 'Explain how Gemini 2.5 Pro achieves 83.2% on AIME 2025 and what Iterative Thought Refinement means for reasoning AI',
  },
  {
    id: 'scaling-laws-multimodal',
    title: 'Scaling laws for multimodal models: new empirical findings',
    summary: 'Research reveals unexpected scaling dynamics when combining vision and language, showing a 31% efficiency gap compared to unimodal models at 70-100B parameter scale.',
    lab: 'MIT CSAIL',
    category: 'multimodal',
    publishedAt: '2026-03-22',
    stats: [
      { label: 'Plateau point', value: '70-100B' },
      { label: 'Efficiency gap', value: '31%' },
      { label: 'Models benchmarked', value: '12' },
    ],
    models: ['Gemini 3.1 Pro', 'GPT-5', 'Llama 4 Maverick', 'Qwen3-Max'],
    discussPrompt: 'What are the key scaling law differences between multimodal and unimodal models, and how does this affect training efficiency?',
  },
  {
    id: 'constitutional-ai-v2',
    title: 'Constitutional AI v2: improved alignment through iterative refinement',
    summary: 'New methodology achieves 40% reduction in harmful outputs while preserving 99.5% of general capability through iterative constitutional refinement.',
    lab: 'Anthropic',
    category: 'alignment',
    publishedAt: '2026-03-18',
    stats: [
      { label: 'Harmful output reduction', value: '-40%' },
      { label: 'Capability drop', value: '<0.5%' },
      { label: 'Constitution version', value: 'v2.0' },
    ],
    models: ['Claude Opus 4.6', 'Claude Haiku 4.5', 'Claude Sonnet 4.6'],
    discussPrompt: 'Explain Constitutional AI v2 and how iterative refinement reduces harmful outputs without sacrificing capability',
  },
  {
    id: 'llama-4-multimodal',
    title: 'Llama 4 Scout & Maverick: natively multimodal from the ground up',
    summary: '17B MoE architecture trained on 40 trillion tokens with native understanding across text, image, and video in 119 languages.',
    lab: 'Meta AI',
    category: 'open-weights',
    publishedAt: '2026-03-15',
    stats: [
      { label: 'Maverick params', value: '400B' },
      { label: 'Languages supported', value: '119' },
      { label: 'Training tokens', value: '40T' },
    ],
    models: ['Llama 4 Maverick', 'Llama 4 Scout', 'GPT-4o', 'Claude Sonnet 4.6'],
    discussPrompt: "How does Llama 4 Maverick's 400B MoE architecture compare to dense models, and what makes it natively multimodal?",
  },
  {
    id: 'long-context-recall',
    title: 'Long-context recall: how models handle 1M+ token windows',
    summary: 'Comprehensive evaluation of 14 models shows sharp recall degradation beyond 200K tokens, with only Kimi-k2.5 and GLM-5 maintaining above 70% at 1M tokens.',
    lab: 'Stanford NLP',
    category: 'efficiency',
    publishedAt: '2026-03-10',
    stats: [
      { label: 'Recall at 1M tokens', value: '34% avg' },
      { label: 'Recall at 100K', value: '91% avg' },
      { label: 'Models tested', value: '14' },
    ],
    models: ['Kimi K2.5', 'GLM-5', 'Claude Opus 4.6', 'Gemini 3.1 Pro'],
    discussPrompt: 'Why do most models lose recall accuracy beyond 200K tokens, and what architectural choices help Kimi-k2.5 maintain performance at 1M tokens?',
  },
  {
    id: 'deepseek-r1-reasoning',
    title: 'DeepSeek-R1: open-source reasoning matches closed frontier models',
    summary: 'DeepSeek-R1 demonstrates that reinforcement learning from AI feedback (RLAIF) can achieve o1-level reasoning at 1/40th the inference cost using chain-of-thought distillation.',
    lab: 'DeepSeek AI',
    category: 'reasoning',
    publishedAt: '2026-03-08',
    stats: [
      { label: 'AIME 2024 score', value: '79.8%' },
      { label: 'Cost vs o1', value: '2.5%' },
      { label: 'Parameters', value: '671B' },
    ],
    models: ['DeepSeek-R1', 'o1', 'Claude Opus 4.6', 'Gemini 2.5 Pro'],
    discussPrompt: 'How does DeepSeek-R1 achieve frontier-level reasoning at a fraction of the cost, and what does this mean for open-source AI?',
  },
  {
    id: 'mixture-of-experts-efficiency',
    title: 'Sparse MoE at scale: efficiency lessons from 100+ trillion token training runs',
    summary: 'Analysis across 8 MoE models shows that expert utilization imbalance is the primary bottleneck — new load-balancing techniques improve throughput by 2.4x.',
    lab: 'EleutherAI',
    category: 'efficiency',
    publishedAt: '2026-03-05',
    stats: [
      { label: 'Throughput gain', value: '2.4x' },
      { label: 'Expert utilization', value: '94%' },
      { label: 'Models analyzed', value: '8' },
    ],
    models: ['Mixtral 8x22B', 'Llama 4 Maverick', 'Qwen3-235B', 'DBRX'],
    discussPrompt: 'What is expert utilization imbalance in sparse MoE models, and how do the new load-balancing techniques achieve 2.4x throughput gains?',
  },
];

@Injectable()
export class DiscoverService {
  constructor(@InjectModel(Paper.name) private paperModel: Model<PaperDocument>) {}

  // Returns static papers directly — no DB required
  findAll(category?: string): StaticPaper[] {
    if (category && category !== 'all') {
      return STATIC_PAPERS.filter((p) => p.category === category);
    }
    return STATIC_PAPERS;
  }

  findByCategory(category: string): StaticPaper[] {
    return STATIC_PAPERS.filter((p) => p.category === category);
  }

  async toggleBookmark(paperId: string, userId: string) {
    const paper = await this.paperModel.findById(paperId);
    if (!paper) return null;
    const idx = paper.bookmarks.findIndex((b) => b.toString() === userId);
    if (idx >= 0) paper.bookmarks.splice(idx, 1);
    else paper.bookmarks.push(userId as any);
    await paper.save();
    return paper.toObject();
  }

  async seed() {
    const count = await this.paperModel.countDocuments();
    if (count > 0) return { message: 'Already seeded' };

    const papers = STATIC_PAPERS.map(({ id: _id, ...rest }) => ({
      ...rest,
      publishedAt: new Date(rest.publishedAt),
    }));

    await this.paperModel.insertMany(papers);
    return { message: `Seeded ${papers.length} research papers` };
  }
}
