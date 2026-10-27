'use client';

import React from 'react';
import ThemeToggle from './ThemeToggle';
import LangSwitcher from './LangSwitcher';
import AppInfo from './AppInfo';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-panel/95 backdrop-blur-none px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo and Technical Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold tracking-tight text-text">
            <span className="text-accent">[&gt;_]</span>
            <span>pocketRag</span>
            <span className="text-muted text-[11px] font-mono font-normal">:: v0.4-local</span>
          </div>

          <span className="hidden sm:inline-block h-3.5 w-px bg-border" aria-hidden="true" />

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-muted bg-surface/50 px-2 py-0.5 border border-border">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-text font-medium">VECTOR_DB:</span>
            <span>SQLITE (MOUNTED)</span>
          </div>
        </div>

        {/* Minimalist DevTool Controls */}
        <div className="flex items-center gap-1.5">
          <LangSwitcher />
          <ThemeToggle />
          <AppInfo />
        </div>
      </div>
    </header>
  );
};
