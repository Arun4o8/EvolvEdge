
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types';
import { MoonIcon, SunIcon } from '../constants';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === Theme.Light ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};
