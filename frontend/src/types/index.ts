export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  language: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    user: User;
  };
}

export interface ChatSession {
  _id: string;
  userId: string;
  title: string;
  modelId: string;
  modelName: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface Attachment {
  type: string;
  url: string;
  name: string;
  size: number;
}

export interface Agent {
  _id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  systemPrompt: string;
  tools: string[];
  memory: { shortTerm: boolean; longTerm: boolean };
  model: string;
  tone: string;
  audience: string;
  status: 'draft' | 'deployed';
  metrics: { messages: number; avgLatency: number; tokensUsed: number };
  createdAt: string;
}

export interface MarketplaceItem {
  _id: string;
  name: string;
  provider: string;
  description: string;
  tags: string[];
  type: string;
  badge?: 'hot' | 'new' | 'open';
  pricing: { inputPer1M: number; outputPer1M: number; tier: string };
  contextWindow: number;
  rating: number;
  reviewCount: number;
  license: string;
  featured: boolean;
}

export interface Paper {
  _id: string;
  title: string;
  summary: string;
  lab: string;
  category: string;
  publishedAt: string;
  stats: { label: string; value: string }[];
  models: string[];
  discussPrompt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
