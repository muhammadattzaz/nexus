import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface ApiPaper {
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

export function useDiscoverPapers(category?: string) {
  return useQuery<ApiPaper[]>({
    queryKey: ['discover', category ?? 'all'],
    queryFn: async () => {
      const params = category && category !== 'all' ? { category } : {};
      const res = await api.get('/discover', { params });
      return res.data.data as ApiPaper[];
    },
    staleTime: 2 * 60 * 1000,
  });
}
