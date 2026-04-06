import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Agent } from '@/types';

export interface CreateAgentPayload {
  name: string;
  description?: string;
  type: string;
  systemPrompt?: string;
  tools?: string[];
  toolConfigs?: Record<string, Record<string, string>>;
  memory?: { shortTerm: boolean; longTerm: boolean };
  model?: string;
  tone?: string;
  audience?: string;
  status?: 'draft' | 'deployed';
}

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get('/agents');
      return res.data.data as Agent[];
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAgentPayload) => {
      const res = await api.post('/agents', payload);
      return res.data.data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<CreateAgentPayload> & { id: string }) => {
      const res = await api.patch(`/agents/${id}`, payload);
      return res.data.data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/agents/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useSeedAgents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/agents/seed');
      return res.data.data as { seeded: number; message: string };
    },
    onSuccess: (data) => {
      if (data.seeded > 0) {
        queryClient.invalidateQueries({ queryKey: ['agents'] });
      }
    },
  });
}
