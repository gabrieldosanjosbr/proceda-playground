import { useEffect, useState } from 'react';
import type { Theme } from '../types';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('proceda-theme', theme);
    } catch (_) {}
  }, [theme]);

  return { theme, toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark') };
}
