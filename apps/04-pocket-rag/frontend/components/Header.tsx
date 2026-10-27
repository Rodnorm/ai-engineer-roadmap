'use client';

import React from 'react';
import { Database, Sparkles } from 'lucide-react';

import ThemeToggle from './ThemeToggle';
import LangSwitcher from './LangSwitcher';
import AppInfo from './AppInfo';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-panel/85 backdrop-blur-md px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
            <Database className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold tracking-tight text-text">
                pocket<span className="text-accent">Rag</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Local Vector DB
              </span>
            </div>
            <p className="text-[11px] text-muted">
              Personal AI Knowledge Base • SQLite Vector + OpenAI LLM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <AppInfo />
        </div>
      </div>
    </header>
  );
};
