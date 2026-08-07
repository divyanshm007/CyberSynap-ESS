import { useEffect } from 'react';
import { useThemeStore } from '@/store';

export function useTheme() {
  const { theme, resolvedTheme, setTheme, toggle } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    setTheme(theme);
    // Listen for OS theme changes when in "system" mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') setTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, setTheme]);

  return { theme, resolvedTheme, setTheme, toggle };
}
