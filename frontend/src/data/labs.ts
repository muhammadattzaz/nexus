export interface LabData {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  modelCount: number;
  topModels: string;
}

export const LABS: LabData[] = [
  { id: 'openai', name: 'OpenAI', emoji: '🧠', tagline: 'GPT-5, Sora 2', modelCount: 11, topModels: 'GPT-5.4, Sora 2' },
  { id: 'anthropic', name: 'Anthropic', emoji: '⚡', tagline: 'Opus, Sonnet, Haiku', modelCount: 8, topModels: 'Opus, Sonnet, Haiku' },
  { id: 'google', name: 'Google DeepMind', emoji: '🔬', tagline: 'Gemini 3.1, Veo 3', modelCount: 8, topModels: 'Gemini 3.1, Veo 3' },
  { id: 'xai', name: 'xAI (Grok)', emoji: '𝕏', tagline: 'Grok-4-1, Grok-Imagine', modelCount: 6, topModels: 'Grok-4-1, Grok-Imagine' },
  { id: 'deepseek', name: 'DeepSeek', emoji: '💻', tagline: 'V3, V3.2, R1', modelCount: 6, topModels: 'V3, V3.2, R1' },
  { id: 'meta', name: 'Meta (Llama)', emoji: '🦙', tagline: 'Maverick, Scout', modelCount: 8, topModels: 'Maverick, Scout' },
  { id: 'alibaba', name: 'Alibaba (Qwen)', emoji: '🀄', tagline: 'Qwen3-Max, Coder', modelCount: 9, topModels: 'Qwen3-Max, Coder' },
  { id: 'mistral', name: 'Mistral', emoji: '🌀', tagline: 'Devstral 2, Medium 3.1', modelCount: 8, topModels: 'Devstral 2, Medium 3.1' },
  { id: 'nvidia', name: 'NVIDIA NIM', emoji: '🟢', tagline: 'Nemotron Ultra, Nano', modelCount: 3, topModels: 'Nemotron Ultra, Nano' },
  { id: 'zhipu', name: 'GLM (Zhipu)', emoji: '🔷', tagline: 'GLM-5, 4.7, 4.6V', modelCount: 5, topModels: 'GLM-5, 4.7, 4.6V' },
  { id: 'moonshot', name: 'Moonshot (Kimi)', emoji: '🌙', tagline: 'k2.5, k2-Thinking', modelCount: 3, topModels: 'k2.5, k2-Thinking' },
];
