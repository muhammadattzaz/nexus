import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface Suggestion {
  icon: string;
  text: string;
}

export function useSuggestions(type: string) {
  return useQuery<Suggestion[]>({
    queryKey: ['suggestions', type],
    queryFn: async () => {
      const res = await api.get('/suggestions', { params: { type } });
      return res.data.data as Suggestion[];
    },
    staleTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
