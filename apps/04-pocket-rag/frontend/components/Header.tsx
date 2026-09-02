'use client';

import React from 'react';
import { Database, Zap, Sparkles, ShieldCheck, DollarSign } from 'lucide-react';

interface HeaderProps {
  lang: 'en' | 'pt-BR' | 'de';
  onLangChange: (lang: 'en' | 'pt-BR' | 'de') => void;
  monthlySavings: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLangChange,
  monthlySavings,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                pocket<span className="text-sky-400">Rag</span>
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-300">
                <Sparkles className="h-3 w-3 text-sky-400" /> Local Vector DB
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personal AI Knowledge Base • Local ChromaDB + OpenAI LLM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Savings Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs text-emerald-400">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold">${monthlySavings.toFixed(0)}/mo</span>
            <span className="text-slate-400">Cloud Saved</span>
          </div>

          {/* Language Selector */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => onLangChange('en')}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                lang === 'en'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('pt-BR')}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                lang === 'pt-BR'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => onLangChange('de')}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                lang === 'de'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DE
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
