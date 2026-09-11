'use client';

import React from 'react';
import { Database, Sparkles } from 'lucide-react';

import ThemeToggle from './ThemeToggle';
import LangSwitcher from './LangSwitcher';
import AppInfo from './AppInfo';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-panel/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-text">
                  pocket<span className="text-sky-500 dark:text-sky-400">Rag</span>
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-300">
                  <Sparkles className="h-3 w-3 text-sky-500 dark:text-sky-400" /> Local Vector DB
                </span>
              </div>
              <p className="text-xs text-muted">
                Personal AI Knowledge Base • SQLite Vector + OpenAI LLM
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LangSwitcher />
          <ThemeToggle />
          <AppInfo />
        </div>
      </div>
    </header>
  );
};
