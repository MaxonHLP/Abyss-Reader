import { create } from 'zustand';

export type ToastType = 'DATA_CORE' | 'ISOLATION' | 'LIMIT';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastMessage[];
  showToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }]
    }));
    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),
}));
