import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../utils';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nofomo_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('nofomo_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('nofomo_theme', 'light');
    }
  }, [theme]);

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-900/90 border border-white/10 shadow-sm backdrop-blur-md">
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Switch to Light Mode"
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
          theme === 'light'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        )}
      >
        <Sun size={14} className={cn(theme === 'light' ? 'text-amber-500 fill-amber-400' : '')} />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Switch to Dark Mode"
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
          theme === 'dark'
            ? 'bg-lavender-500/25 text-lavender-200 border border-lavender-500/40 shadow-glow-lavender font-bold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        )}
      >
        <Moon size={14} className={cn(theme === 'dark' ? 'text-lavender-300 fill-lavender-400' : '')} />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
