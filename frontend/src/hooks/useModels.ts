import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ModelData } from '@/data/models';

export interface ModelsQuery {
  search?: string;
  type?: string;
  provider?: string;
  tier?: string;
}

export function useModels(params?: ModelsQuery) {
  return useQuery<ModelData[]>({
    queryKey: ['models', params],
    queryFn: async () => {
      const res = await api.get('/models', { params });
      return res.data.data as ModelData[];
    },
    staleTime: 5 * 60 * 1000, // 5 min — catalog rarely changes
  });
}

export function useModel(id: string | null) {
  return useQuery<ModelData>({
    queryKey: ['models', id],
    queryFn: async () => {
      const res = await api.get(`/models/${id}`);
      return res.data.data as ModelData;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
