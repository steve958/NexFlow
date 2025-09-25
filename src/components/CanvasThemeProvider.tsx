"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type CanvasTheme = 'light' | 'dark';

interface CanvasThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: CanvasTheme;
}

interface CanvasThemeProviderState {
  theme: CanvasTheme;
  setTheme: (theme: CanvasTheme) => void;
  isDark: boolean;
}

const initialState: CanvasThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
  isDark: true,
};

const CanvasThemeProviderContext = createContext<CanvasThemeProviderState>(initialState);

export function CanvasThemeProvider({
  children,
  defaultTheme = 'dark',
}: CanvasThemeProviderProps) {
  const [theme, setTheme] = useState<CanvasTheme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('nexflow-canvas-theme') as CanvasTheme;
    if (stored && (stored === 'light' || stored === 'dark')) {
      setTheme(stored);
    }
  }, []);

  const isDark = theme === 'dark';

  const value = {
    theme,
    setTheme: (theme: CanvasTheme) => {
      localStorage.setItem('nexflow-canvas-theme', theme);
      setTheme(theme);
    },
    isDark,
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Canvas</h2>
          <p className="text-gray-300">Preparing your diagram canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <CanvasThemeProviderContext.Provider value={value}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </CanvasThemeProviderContext.Provider>
  );
}

export const useCanvasTheme = () => {
  const context = useContext(CanvasThemeProviderContext);

  if (context === undefined)
    throw new Error('useCanvasTheme must be used within a CanvasThemeProvider');

  return context;
};