'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import Toast from '@/components/ui/Toast';
import AuthInit from '@/components/AuthInit';
import ThemeApplier from '@/components/ThemeApplier';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => queryClient);

  return (
    <QueryClientProvider client={qc}>
      <ThemeApplier />
      <AuthInit />
      {children}
      <Toast />
    </QueryClientProvider>
  );
}
