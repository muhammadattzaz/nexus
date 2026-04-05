import { Injectable } from '@nestjs/common';

export interface ModelData {
  id: string;
  name: string;
  provider: string;
  description: string;
  tags: string[];
  badge?: 'hot' | 'new' | 'open';
  pricing: { inputPer1M: number; outputPer1M: string; tier: string };
  contextWindow: string;
  rating: number;
  reviewCount: number;
  emoji: string;
  type: string;
}

const STATIC_MODELS: ModelData[] = [
  // ── OpenAI ──────────────────────────────────────────────────────────
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', description: 'Most capable GPT model with advanced reasoning and multimodal capabilities', tags: ['Flagship', 'Agents', 'Multimodal', 'Reasoning'], badge: 'hot', pricing: { inputPer1M: 7.5, outputPer1M: '$30', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.9, reviewCount: 12847, emoji: '🧠', type: 'language' },
  { id: 'gpt-5-2', name: 'GPT-5.2', provider: 'OpenAI', description: 'Balanced multimodal model optimized for instruction following', tags: ['Multimodal', 'Balanced', 'Instruction'], badge: 'new', pricing: { inputPer1M: 4, outputPer1M: '$16', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.8, reviewCount: 5234, emoji: '⚡', type: 'language' },
  { id: 'gpt-5-turbo', name: 'GPT-5 Turbo', provider: 'OpenAI', description: 'Fast and cost-effective for high-volume tasks', tags: ['Fast', 'Cost-Effective', 'High-Volume'], badge: 'hot', pricing: { inputPer1M: 2.5, outputPer1M: '$10', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.8, reviewCount: 8932, emoji: '🚀', type: 'language' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Multimodal model with vision, audio, and coding capabilities', tags: ['Multimodal', 'Vision', 'Audio', 'Coding'], pricing: { inputPer1M: 2.5, outputPer1M: '$10', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.7, reviewCount: 23456, emoji: '👁', type: 'vision' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', description: 'Fast and affordable for everyday tasks', tags: ['Fast', 'Budget', 'Chat'], pricing: { inputPer1M: 0.15, outputPer1M: '$0.60', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.6, reviewCount: 18234, emoji: '💨', type: 'language' },
  { id: 'o3', name: 'o3', provider: 'OpenAI', description: 'Advanced reasoning model for math, science, and complex logic', tags: ['Reasoning', 'Math', 'Science', 'Logic'], badge: 'hot', pricing: { inputPer1M: 15, outputPer1M: '$60', tier: 'pay-per-use' }, contextWindow: '200K', rating: 4.9, reviewCount: 7823, emoji: '🔬', type: 'language' },
  { id: 'o4-mini', name: 'o4-mini', provider: 'OpenAI', description: 'Compact reasoning model with best value for STEM tasks', tags: ['Reasoning', 'Compact', 'Best Value'], badge: 'new', pricing: { inputPer1M: 1.1, outputPer1M: '$4.40', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.7, reviewCount: 4521, emoji: '🧪', type: 'language' },
  { id: 'dalle-4', name: 'DALL·E 4', provider: 'OpenAI', description: 'State-of-the-art image generation with photorealistic outputs', tags: ['Image Gen', 'Creative', 'Photorealistic'], badge: 'new', pricing: { inputPer1M: 0, outputPer1M: '$0.04/img', tier: 'pay-per-use' }, contextWindow: '-', rating: 4.7, reviewCount: 6543, emoji: '🎨', type: 'image' },
  { id: 'sora-v2', name: 'Sora v2', provider: 'OpenAI', description: 'Advanced text-to-video model with photorealistic generation', tags: ['Video Gen', 'Text-to-Video', 'Photorealistic'], badge: 'new', pricing: { inputPer1M: 0, outputPer1M: '$0.08/s', tier: 'pay-per-use' }, contextWindow: '-', rating: 4.7, reviewCount: 5432, emoji: '🎬', type: 'video' },
  // ── Anthropic ────────────────────────────────────────────────────────
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', description: 'Most powerful Claude model with extended thinking and agent capabilities', tags: ['Agents', 'Coding', 'Extended Thinking', 'Agent Use'], badge: 'hot', pricing: { inputPer1M: 5, outputPer1M: '$25', tier: 'pay-per-use' }, contextWindow: '1M', rating: 4.9, reviewCount: 9234, emoji: '🤖', type: 'language' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', description: 'Balanced model with extended thinking and fast coding performance', tags: ['Balanced', 'Fast', 'Code', 'Extended Thinking'], badge: 'new', pricing: { inputPer1M: 3, outputPer1M: '$15', tier: 'pay-per-use' }, contextWindow: '200K', rating: 4.8, reviewCount: 12456, emoji: '🎵', type: 'language' },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'Anthropic', description: 'Fastest Claude model for real-time applications', tags: ['Fastest', 'Low Cost', 'Real-time'], pricing: { inputPer1M: 1, outputPer1M: '$5', tier: 'pay-per-use' }, contextWindow: '200K', rating: 4.6, reviewCount: 8765, emoji: '⚡', type: 'language' },
  // ── Google DeepMind ──────────────────────────────────────────────────
  { id: 'gemini-3-1-pro', name: 'Gemini 3.1 Pro', provider: 'Google DeepMind', description: 'Deep reasoning with 5M context window and Thought Signatures', tags: ['Deep Reasoning', '5M Context', 'Thought Signatures'], badge: 'new', pricing: { inputPer1M: 2, outputPer1M: '$8', tier: 'pay-per-use' }, contextWindow: '5M', rating: 4.8, reviewCount: 6543, emoji: '🔬', type: 'language' },
  { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', provider: 'Google DeepMind', description: 'SOTA reasoning with 1M context window', tags: ['SOTA', 'Reasoning', '1M Context'], badge: 'hot', pricing: { inputPer1M: 1.25, outputPer1M: '$5', tier: 'pay-per-use' }, contextWindow: '1M', rating: 4.8, reviewCount: 11234, emoji: '💎', type: 'language' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google DeepMind', description: 'Fast 1M context model for chat and coding', tags: ['Fast', '1M Context', 'Chat', 'Coding'], badge: 'hot', pricing: { inputPer1M: 0.5, outputPer1M: '$2', tier: 'pay-per-use' }, contextWindow: '1M', rating: 4.7, reviewCount: 9876, emoji: '⚡', type: 'language' },
  { id: 'gemini-2-flash-image', name: 'Gemini 2.0 Flash Image', provider: 'Google DeepMind', description: 'Native multimodal image understanding and generation', tags: ['Multimodal', 'Image Gen', 'Fast'], badge: 'new', pricing: { inputPer1M: 0.1, outputPer1M: '$0.40', tier: 'pay-per-use' }, contextWindow: '1M', rating: 4.5, reviewCount: 3210, emoji: '🖼️', type: 'image' },
  // ── Meta ─────────────────────────────────────────────────────────────
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', description: '400B MoE natively multimodal model trained on 40T tokens', tags: ['Multimodal', 'Open Source', 'MoE'], badge: 'hot', pricing: { inputPer1M: 0, outputPer1M: 'Free self-host', tier: 'open-source' }, contextWindow: '10M', rating: 4.7, reviewCount: 7654, emoji: '🦙', type: 'language' },
  { id: 'llama-4-scout', name: 'Llama 4 Scout', provider: 'Meta', description: 'Efficient multimodal model supporting 119 languages', tags: ['Multimodal', 'Open Source', 'Multilingual'], badge: 'open', pricing: { inputPer1M: 0, outputPer1M: 'Free', tier: 'open-source' }, contextWindow: '10M', rating: 4.6, reviewCount: 5432, emoji: '🦙', type: 'language' },
  { id: 'llama-3-3-70b', name: 'Llama 3.3 70B', provider: 'Meta', description: 'High-performance open-source model with strong coding ability', tags: ['Open Source', 'Coding', 'Multilingual'], badge: 'open', pricing: { inputPer1M: 0, outputPer1M: 'Free', tier: 'open-source' }, contextWindow: '128K', rating: 4.5, reviewCount: 9876, emoji: '🦙', type: 'language' },
  // ── DeepSeek ─────────────────────────────────────────────────────────
  { id: 'deepseek-r1', name: 'DeepSeek-R1', provider: 'DeepSeek', description: 'Open-source reasoning model matching o1 performance', tags: ['Reasoning', 'Open Source', 'STEM'], badge: 'open', pricing: { inputPer1M: 0.14, outputPer1M: '$0.55', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.7, reviewCount: 8901, emoji: '🔍', type: 'language' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3', provider: 'DeepSeek', description: 'State-of-the-art open-source language model', tags: ['Open Source', 'Coding', 'Efficient'], badge: 'open', pricing: { inputPer1M: 0.07, outputPer1M: '$0.28', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.6, reviewCount: 6789, emoji: '🌊', type: 'language' },
  { id: 'deepseek-prover-v2', name: 'DeepSeek Prover V2', provider: 'DeepSeek', description: 'Specialized for mathematical proofs and formal verification', tags: ['Math', 'Proof', 'Formal Verification'], badge: 'new', pricing: { inputPer1M: 0.14, outputPer1M: '$0.55', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.6, reviewCount: 1234, emoji: '📐', type: 'language' },
  // ── Alibaba Qwen ─────────────────────────────────────────────────────
  { id: 'qwen3-max', name: 'Qwen3-Max', provider: 'Alibaba (Qwen)', description: 'Top-tier Qwen model with extended reasoning', tags: ['Reasoning', 'Multilingual', 'Code'], badge: 'new', pricing: { inputPer1M: 0.4, outputPer1M: '$1.60', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.6, reviewCount: 3456, emoji: '🀄', type: 'language' },
  { id: 'qwen3-235b', name: 'Qwen3-235B-A22B', provider: 'Alibaba (Qwen)', description: 'Massive MoE model with hybrid thinking capabilities', tags: ['Open Source', 'MoE', 'Hybrid Thinking'], badge: 'open', pricing: { inputPer1M: 0, outputPer1M: 'Free', tier: 'open-source' }, contextWindow: '128K', rating: 4.5, reviewCount: 2345, emoji: '🀄', type: 'language' },
  // ── xAI Grok ─────────────────────────────────────────────────────────
  { id: 'grok-4', name: 'Grok-4', provider: 'xAI', description: '4-agent architecture with real-time X data access', tags: ['Real-time', 'Agents', '2M Context'], badge: 'new', pricing: { inputPer1M: 3, outputPer1M: '$12', tier: 'pay-per-use' }, contextWindow: '2M', rating: 4.7, reviewCount: 4567, emoji: '𝕏', type: 'language' },
  { id: 'grok-4-fast', name: 'Grok-4 Fast', provider: 'xAI', description: 'Faster variant with real-time data integration', tags: ['Fast', 'Real-time', 'High-Volume'], badge: 'hot', pricing: { inputPer1M: 0.2, outputPer1M: '$0.80', tier: 'pay-per-use' }, contextWindow: '2M', rating: 4.6, reviewCount: 3210, emoji: '⚡', type: 'language' },
  { id: 'grok-3', name: 'Grok-3', provider: 'xAI', description: 'Advanced reasoning with web search integration', tags: ['Web Search', 'Reasoning', 'Real-time'], pricing: { inputPer1M: 3, outputPer1M: '$15', tier: 'pay-per-use' }, contextWindow: '131K', rating: 4.5, reviewCount: 5678, emoji: '𝕏', type: 'language' },
  // ── Mistral AI ───────────────────────────────────────────────────────
  { id: 'mistral-large-3', name: 'Mistral Large 3', provider: 'Mistral AI', description: 'Frontier model with strong reasoning and code generation', tags: ['Reasoning', 'Code', 'Multilingual'], badge: 'new', pricing: { inputPer1M: 2, outputPer1M: '$6', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.6, reviewCount: 4321, emoji: '🌀', type: 'language' },
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'Mistral AI', description: 'Open-source MoE model with strong multilingual capabilities', tags: ['Open Source', 'MoE', 'Multilingual'], badge: 'open', pricing: { inputPer1M: 0, outputPer1M: 'Free', tier: 'open-source' }, contextWindow: '64K', rating: 4.5, reviewCount: 7890, emoji: '🌊', type: 'language' },
  { id: 'codestral-25-01', name: 'Codestral 25.01', provider: 'Mistral AI', description: 'State-of-the-art code generation model from Mistral', tags: ['Code', 'Completion', '256K Context'], badge: 'new', pricing: { inputPer1M: 0.3, outputPer1M: '$0.90', tier: 'pay-per-use' }, contextWindow: '256K', rating: 4.7, reviewCount: 2987, emoji: '💻', type: 'code' },
  // ── Microsoft ────────────────────────────────────────────────────────
  { id: 'phi-4', name: 'Phi-4', provider: 'Microsoft', description: 'Compact but powerful model from Microsoft Research', tags: ['Efficient', 'Reasoning', 'STEM'], badge: 'new', pricing: { inputPer1M: 0.07, outputPer1M: '$0.28', tier: 'pay-per-use' }, contextWindow: '16K', rating: 4.5, reviewCount: 2345, emoji: '🔷', type: 'language' },
  { id: 'phi-4-reasoning', name: 'Phi-4 Reasoning', provider: 'Microsoft', description: 'Phi-4 fine-tuned for chain-of-thought reasoning', tags: ['Reasoning', 'Compact', 'STEM'], badge: 'new', pricing: { inputPer1M: 0.1, outputPer1M: '$0.40', tier: 'pay-per-use' }, contextWindow: '16K', rating: 4.5, reviewCount: 1234, emoji: '🔷', type: 'language' },
  // ── Cohere ───────────────────────────────────────────────────────────
  { id: 'command-a', name: 'Command A', provider: 'Cohere', description: 'Enterprise-grade RAG and business document model', tags: ['RAG', 'Enterprise', 'Business'], badge: 'new', pricing: { inputPer1M: 2.5, outputPer1M: '$10', tier: 'pay-per-use' }, contextWindow: '256K', rating: 4.5, reviewCount: 1987, emoji: '⚡', type: 'language' },
  { id: 'command-r-plus', name: 'Command R+', provider: 'Cohere', description: 'Highly capable model with grounded generation and RAG', tags: ['RAG', 'Enterprise', 'Grounded'], pricing: { inputPer1M: 3, outputPer1M: '$15', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.4, reviewCount: 3456, emoji: '⚡', type: 'language' },
  // ── Google Open ──────────────────────────────────────────────────────
  { id: 'gemma-3', name: 'Gemma 3', provider: 'Google (Open)', description: 'Google open-source model family for research and production', tags: ['Open Source', 'Research', 'Efficient'], badge: 'new', pricing: { inputPer1M: 0, outputPer1M: 'Free', tier: 'open-source' }, contextWindow: '128K', rating: 4.4, reviewCount: 3456, emoji: '🌟', type: 'language' },
  { id: 'paligemma-2', name: 'PaliGemma 2', provider: 'Google (Open)', description: 'Open-source vision-language model for image understanding', tags: ['Vision', 'Open Source', 'Research'], badge: 'open', pricing: { inputPer1M: 0, outputPer1M: 'Free', tier: 'open-source' }, contextWindow: '32K', rating: 4.3, reviewCount: 1234, emoji: '👁', type: 'vision' },
  // ── Amazon ───────────────────────────────────────────────────────────
  { id: 'nova-pro', name: 'Nova Pro', provider: 'Amazon', description: 'AWS Nova Pro for enterprise multimodal tasks', tags: ['Multimodal', 'Enterprise', 'AWS'], pricing: { inputPer1M: 0.8, outputPer1M: '$3.20', tier: 'pay-per-use' }, contextWindow: '300K', rating: 4.4, reviewCount: 2109, emoji: '☁️', type: 'language' },
  { id: 'nova-lite', name: 'Nova Lite', provider: 'Amazon', description: 'Ultra-low cost multimodal model for high-volume tasks', tags: ['Budget', 'Multimodal', 'High-Volume'], pricing: { inputPer1M: 0.06, outputPer1M: '$0.24', tier: 'pay-per-use' }, contextWindow: '300K', rating: 4.2, reviewCount: 1876, emoji: '☁️', type: 'language' },
  // ── Stability AI ─────────────────────────────────────────────────────
  { id: 'stable-diffusion-4', name: 'Stable Diffusion 4', provider: 'Stability AI', description: 'Latest Stable Diffusion with improved photorealism', tags: ['Image Gen', 'Open Source', 'Photorealistic'], badge: 'open', pricing: { inputPer1M: 0, outputPer1M: 'Free', tier: 'open-source' }, contextWindow: '-', rating: 4.5, reviewCount: 15432, emoji: '🎨', type: 'image' },
  // ── Midjourney ───────────────────────────────────────────────────────
  { id: 'midjourney-v7', name: 'Midjourney v7', provider: 'Midjourney', description: 'Industry-leading artistic image generation', tags: ['Image Gen', 'Artistic', 'Creative'], badge: 'hot', pricing: { inputPer1M: 0, outputPer1M: '$10/mo', tier: 'subscription' }, contextWindow: '-', rating: 4.8, reviewCount: 45678, emoji: '🎨', type: 'image' },
  // ── Runway ───────────────────────────────────────────────────────────
  { id: 'runway-gen-4', name: 'Runway Gen-4', provider: 'Runway', description: 'State-of-the-art text-to-video generation', tags: ['Video Gen', 'Creative', 'Text-to-Video'], badge: 'new', pricing: { inputPer1M: 0, outputPer1M: '$0.05/s', tier: 'pay-per-use' }, contextWindow: '-', rating: 4.6, reviewCount: 8765, emoji: '🎬', type: 'video' },
  // ── ElevenLabs ───────────────────────────────────────────────────────
  { id: 'elevenlabs-v3', name: 'ElevenLabs v3', provider: 'ElevenLabs', description: 'Most realistic AI voice synthesis with emotional control', tags: ['Audio', 'TTS', 'Voice Cloning'], badge: 'hot', pricing: { inputPer1M: 0, outputPer1M: '$0.30/1K chars', tier: 'pay-per-use' }, contextWindow: '-', rating: 4.8, reviewCount: 23456, emoji: '🎵', type: 'audio' },
  // ── AI21 Labs ────────────────────────────────────────────────────────
  { id: 'jamba-2', name: 'Jamba 2', provider: 'AI21 Labs', description: 'Hybrid SSM-Transformer model with 256K context', tags: ['Long Context', 'Efficient', 'SSM'], badge: 'new', pricing: { inputPer1M: 0.5, outputPer1M: '$0.70', tier: 'pay-per-use' }, contextWindow: '256K', rating: 4.4, reviewCount: 1567, emoji: '🧬', type: 'language' },
  // ── Inflection ───────────────────────────────────────────────────────
  { id: 'inflection-3', name: 'Inflection 3', provider: 'Inflection AI', description: 'Emotionally intelligent AI with high EQ and empathy', tags: ['Conversational', 'Empathy', 'High EQ'], pricing: { inputPer1M: 2.5, outputPer1M: '$10', tier: 'pay-per-use' }, contextWindow: '64K', rating: 4.4, reviewCount: 2345, emoji: '💬', type: 'language' },
  // ── Perplexity ───────────────────────────────────────────────────────
  { id: 'sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', description: 'Real-time search-augmented language model with citations', tags: ['Web Search', 'Citations', 'Real-time'], badge: 'hot', pricing: { inputPer1M: 3, outputPer1M: '$15', tier: 'pay-per-use' }, contextWindow: '200K', rating: 4.6, reviewCount: 7654, emoji: '🔍', type: 'language' },
  // ── Groq ─────────────────────────────────────────────────────────────
  { id: 'llama-3-1-405b-groq', name: 'Llama 3.1 405B (Groq)', provider: 'Groq', description: 'Meta Llama running at ultra-fast inference speeds on Groq LPU', tags: ['Ultra-Fast', 'Open Source', 'High-Volume'], pricing: { inputPer1M: 5, outputPer1M: '$5', tier: 'pay-per-use' }, contextWindow: '128K', rating: 4.5, reviewCount: 3456, emoji: '⚡', type: 'language' },
  // ── Together AI ──────────────────────────────────────────────────────
  { id: 'together-moe', name: 'Together MoE Titan', provider: 'Together AI', description: 'Optimized mixture-of-experts inference at scale', tags: ['MoE', 'Scale', 'Fast Inference'], pricing: { inputPer1M: 1.2, outputPer1M: '$1.20', tier: 'pay-per-use' }, contextWindow: '32K', rating: 4.3, reviewCount: 2109, emoji: '🤝', type: 'language' },
  // ── Databricks ───────────────────────────────────────────────────────
  { id: 'dbrx-instruct', name: 'DBRX Instruct', provider: 'Databricks', description: 'High-quality open MoE LLM for enterprise use cases', tags: ['Open Source', 'Enterprise', 'MoE'], badge: 'open', pricing: { inputPer1M: 0, outputPer1M: 'Free', tier: 'open-source' }, contextWindow: '32K', rating: 4.3, reviewCount: 1876, emoji: '🏗️', type: 'language' },
];

export interface ModelsQuery {
  search?: string;
  type?: string;
  provider?: string;
  tier?: string;
}

@Injectable()
export class ModelsService {
  findAll(query: ModelsQuery = {}): ModelData[] {
    let results = [...STATIC_MODELS];

    if (query.search) {
      const s = query.search.toLowerCase();
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.provider.toLowerCase().includes(s) ||
          m.description.toLowerCase().includes(s) ||
          m.tags.some((t) => t.toLowerCase().includes(s)),
      );
    }

    if (query.type) {
      results = results.filter((m) => m.type === query.type);
    }

    if (query.provider) {
      const p = query.provider.toLowerCase();
      results = results.filter((m) => m.provider.toLowerCase().includes(p));
    }

    if (query.tier) {
      results = results.filter((m) => m.pricing.tier === query.tier);
    }

    return results;
  }

  findOne(id: string): ModelData | undefined {
    return STATIC_MODELS.find((m) => m.id === id);
  }
}
