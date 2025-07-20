// import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function DarkModeToggle({ isDark, onToggle }: DarkModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="relative p-3 rounded-2xl bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-700/40 transition-all duration-300 group"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-6 h-6">
        <Sun className={`absolute inset-0 w-6 h-6 text-yellow-400 transition-all duration-500 ${
          isDark ? 'rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`} />
        <Moon className={`absolute inset-0 w-6 h-6 text-blue-300 transition-all duration-500 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'
        }`} />
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
    </button>
  );
}