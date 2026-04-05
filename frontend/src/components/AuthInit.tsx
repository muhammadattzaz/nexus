'use client';

import { useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

/**
 * Runs once on mount and attempts to restore an authenticated session
 * by exchanging the HttpOnly refresh_token cookie for a new access token.
 * Sets isInitializing = false when done (success OR failure) so protected
 * pages can safely decide whether to redirect to /signin.
 */
export default function AuthInit() {
  const { setAuth, setInitializing } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        // Exchange the refresh_token cookie for a new access token.
        // withCredentials is already set on the api instance so the
        // cookie is sent automatically.
        const refreshRes = await api.post('/auth/refresh');
        const { accessToken } = refreshRes.data.data;

        // Fetch the user profile with the fresh token.
        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const user = meRes.data.data;

        if (!cancelled) {
          setAuth(user, accessToken);
        }
      } catch {
        // No valid refresh cookie — user must sign in manually.
        // clearAuth is not called here; the store already starts unauthenticated.
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
