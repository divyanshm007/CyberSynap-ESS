import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types';

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  resolvedTheme: 'light' | 'dark';
}

function applyTheme(theme: Theme): 'light' | 'dark' {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved: 'light' | 'dark' = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        const resolved = applyTheme(theme);
        set({ theme, resolvedTheme: resolved });
      },

      toggle: () => {
        const next: Theme = get().resolvedTheme === 'dark' ? 'light' : 'dark';
        const resolved = applyTheme(next);
        set({ theme: next, resolvedTheme: resolved });
      },
    }),
    { name: 'cybersynap_theme', partialize: (s) => ({ theme: s.theme }) },
  ),
);
