import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ModelData } from '@/data/models';
import { MarketplaceItem } from '@/types';

const TYPE_EMOJI: Record<string, string> = {
  llm: '🧠',
  image: '🎨',
  audio: '🎵',
  embedding: '📊',
  multimodal: '🌐',
  code: '💻',
  vision: '👁️',
  tool: '🔧',
};

// Map backend types to frontend filter types
const TYPE_MAP: Record<string, string> = {
  llm: 'language',
  multimodal: 'language',
  embedding: 'language',
  tool: 'language',
  image: 'image',
  audio: 'audio',
  code: 'code',
  vision: 'vision',
};

function toModelData(item: MarketplaceItem): ModelData {
  const ctx = item.contextWindow;
  const ctxStr =
    ctx >= 1_000_000
      ? `${ctx / 1_000_000}M`
      : ctx >= 1000
      ? `${Math.round(ctx / 1000)}K`
      : `${ctx}`;

  return {
    id: item._id,
    name: item.name,
    provider: item.provider,
    description: item.description ?? '',
    tags: item.tags,
    badge: item.badge,
    pricing: {
      inputPer1M: item.pricing.inputPer1M,
      outputPer1M: `$${item.pricing.outputPer1M}`,
      tier: item.pricing.tier,
    },
    contextWindow: ctxStr,
    rating: item.rating,
    reviewCount: item.reviewCount,
    emoji: TYPE_EMOJI[item.type] ?? '🤖',
    type: TYPE_MAP[item.type] ?? 'language',
  };
}

export function useMarketplace() {
  return useQuery<ModelData[]>({
    queryKey: ['marketplace'],
    queryFn: async () => {
      const res = await api.get('/marketplace/items');
      return (res.data.data as MarketplaceItem[]).map(toModelData);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSeedMarketplace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/marketplace/seed');
      return res.data.data as { message: string; count: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}
