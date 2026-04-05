'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { SocketProvider } from '@/lib/socketContext';
import Toast from '@/components/ui/Toast';
import AuthInit from '@/components/AuthInit';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => queryClient);

  return (
    <QueryClientProvider client={qc}>
      <AuthInit />
      <SocketProvider>
        {children}
        <Toast />
      </SocketProvider>
    </QueryClientProvider>
  );
}
