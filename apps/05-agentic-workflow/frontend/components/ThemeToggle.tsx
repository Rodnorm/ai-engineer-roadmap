'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useT } from '@/lib/i18n/I18nProvider';

const THEME_KEY = 'agentic-workflow-theme';

export function ThemeToggle() {
  const t = useT('controls');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const currentlyDark = document.documentElement.classList.contains('dark');
    const nextIsDark = !currentlyDark;
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem(THEME_KEY, nextIsDark ? 'dark' : 'light');
    setIsDark(nextIsDark);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? t('lightTheme') : t('darkTheme')}
      title={isDark ? t('lightTheme') : t('darkTheme')}
      onClick={toggleTheme}
      className="control-button size-8 p-0 cursor-pointer"
    >
      {isDark ? (
        <Sun className="size-3.5 text-amber-400 hover:text-amber-300 transition-colors" />
      ) : (
        <Moon className="size-3.5 text-slate-700 hover:text-slate-900 transition-colors" />
      )}
    </button>
  );
}
