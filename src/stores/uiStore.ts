import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Theme, Toast, ToastType } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  toasts: Toast[];

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  pushToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

function applyThemeClass(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let toastCounter = 0;
const nextId = () => `toast-${Date.now()}-${++toastCounter}`;

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      sidebarOpen: true,
      toasts: [],

      setTheme(theme) {
        applyThemeClass(theme);
        set({ theme });
      },
      toggleTheme() {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        applyThemeClass(next);
        set({ theme: next });
      },
      toggleSidebar() {
        set({ sidebarOpen: !get().sidebarOpen });
      },
      setSidebarOpen(open) {
        set({ sidebarOpen: open });
      },

      pushToast(toast) {
        const id = nextId();
        const full: Toast = { ...toast, id };
        set({ toasts: [...get().toasts, full] });
        return id;
      },
      dismissToast(id) {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
      },
      clearToasts() {
        set({ toasts: [] });
      },
    }),
    {
      name: 'aidc.ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme);
      },
    },
  ),
);

/** Convenience helper for callsites that don't need the full store. */
export function toast(input: { type?: ToastType; title: string; description?: string; duration?: number }): string {
  const { type = 'info', title, description, duration } = input;
  return useUIStore.getState().pushToast({ type, title, description, duration });
}
