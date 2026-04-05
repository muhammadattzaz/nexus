'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post('/auth/login', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push('/chathub');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await api.post('/auth/register', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push('/chathub');
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      clearAuth();
      router.push('/');
    },
    // Clear local state even if the server call fails
    onError: () => {
      clearAuth();
      router.push('/');
    },
  });
}

/** Returns the current authenticated user. Only runs when accessToken exists. */
export function useGetMe() {
  const { accessToken, setAuth } = useAuthStore();
  return useQuery<User>({
    queryKey: ['auth', 'me'],
    enabled: !!accessToken,
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    },
    // Keep the result fresh while the tab is open
    staleTime: 5 * 60 * 1000,
  });
}

export interface UpdateProfilePayload {
  fullName?: string;
  avatar?: string;
  language?: string;
}

/** Patch the current user's profile via PATCH /users/:id */
export function useUpdateProfile() {
  const { user, accessToken, setAuth } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      if (!user) throw new Error('Not authenticated');
      const res = await api.patch(`/users/${user._id}`, payload);
      return res.data.data as User;
    },
    onSuccess: (updatedUser) => {
      if (accessToken) setAuth(updatedUser, accessToken);
    },
  });
}
