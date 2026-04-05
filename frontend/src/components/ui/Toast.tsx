'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; message: string; type: 'success' | 'error' | 'info' };
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const bg =
    toast.type === 'success'
      ? '#0A5E49'
      : toast.type === 'error'
      ? '#9B2042'
      : '#1C1A16';

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
      style={{
        background: bg,
        animation: 'slideUpToast 0.25s ease-out',
        minWidth: '240px',
        maxWidth: '400px',
      }}
      role="alert"
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="opacity-70 hover:opacity-100 transition-opacity text-white ml-2"
      >
        ✕
      </button>
      <style>{`
        @keyframes slideUpToast {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
