import { create } from 'zustand';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  toasts: ToastItem[];
  modelDetailModal: { open: boolean; modelId: string | null; initialTab?: string };
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  openModelDetail: (modelId: string, tab?: string) => void;
  closeModelDetail: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  modelDetailModal: { open: false, modelId: null, initialTab: 'overview' },

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModelDetail: (modelId, tab = 'overview') =>
    set({ modelDetailModal: { open: true, modelId, initialTab: tab } }),

  closeModelDetail: () =>
    set({ modelDetailModal: { open: false, modelId: null } }),
}));
