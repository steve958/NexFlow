"use client";

import { Moon, Sun } from 'lucide-react';
import { useCanvasTheme } from './CanvasThemeProvider';

export function CanvasThemeToggle() {
  const { theme, setTheme, isDark } = useCanvasTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95
        ${isDark
          ? 'bg-white/5 hover:bg-white/10 border border-white/20 text-white hover:border-yellow-400/50'
          : 'bg-slate-100/60 hover:bg-slate-200/60 border border-slate-300/60 text-slate-700 hover:border-indigo-400/60'
        }
      `}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}