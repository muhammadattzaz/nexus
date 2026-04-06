import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ChatSession, Message } from '@/types';
import { useAuthStore } from '@/store/authStore';

export function useSessions() {
  const { isAuthenticated } = useAuthStore();
  return useQuery<ChatSession[]>({
    queryKey: ['chat', 'sessions'],
    queryFn: async () => {
      const res = await api.get('/chat/sessions');
      return res.data.data as ChatSession[];
    },
    enabled: isAuthenticated,
  });
}

export function useMessages(sessionId: string | null) {
  return useQuery<Message[]>({
    queryKey: ['chat', 'messages', sessionId],
    queryFn: async () => {
      const res = await api.get(`/chat/sessions/${sessionId}/messages`);
      return res.data.data as Message[];
    },
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; modelId: string; modelName: string }) => {
      const res = await api.post('/chat/sessions', data);
      return res.data.data as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      role,
      content,
    }: {
      sessionId: string;
      role: string;
      content: string;
    }) => {
      const res = await api.post(`/chat/sessions/${sessionId}/messages`, { role, content });
      return res.data.data as Message;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', vars.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await api.delete(`/chat/sessions/${sessionId}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
}
