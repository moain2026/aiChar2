import { useUIStore } from '@/stores/uiStore';
import type { Theme } from '@/types';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

/**
 * Hook for accessing and updating the application theme.
 * The theme is persisted in localStorage and applied as a class
 * on the <html> element so Tailwind's dark variants take effect.
 */
export function useTheme(): UseThemeReturn {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
