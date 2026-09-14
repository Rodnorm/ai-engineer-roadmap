'use client';

import React from 'react';
import { Calculator, BookOpen, ShieldAlert, Server } from 'lucide-react';
import { useT } from '@/lib/i18n/I18nProvider';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickPrompts({ onSelectPrompt, disabled }: QuickPromptsProps) {
  const t = useT('prompts');

  const prompts = [
    {
      icon: <Calculator className="w-4 h-4 text-sky-400 shrink-0" />,
      title: t('mathTitle'),
      prompt: t('mathPrompt'),
      tag: t('mathTag'),
      borderHover: 'hover:border-sky-500/50',
    },
    {
      icon: <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />,
      title: t('policyTitle'),
      prompt: t('policyPrompt'),
      tag: t('policyTag'),
      borderHover: 'hover:border-emerald-500/50',
    },
    {
      icon: <Server className="w-4 h-4 text-indigo-400 shrink-0" />,
      title: t('slaTitle'),
      prompt: t('slaPrompt'),
      tag: t('slaTag'),
      borderHover: 'hover:border-indigo-500/50',
    },
    {
      icon: <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />,
      title: t('alertTitle'),
      prompt: t('alertPrompt'),
      tag: t('alertTag'),
      borderHover: 'hover:border-amber-500/50',
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="text-xs uppercase font-semibold tracking-wider text-muted">
        {t('sectionTitle')}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {prompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            disabled={disabled}
            className={`flex flex-col items-start text-left p-3.5 rounded-xl border border-border bg-surface hover:bg-surface/80 ${item.borderHover} transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-xs`}
          >
            <div className="flex items-center justify-between w-full mb-1.5 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {item.icon}
                <span className="font-semibold text-xs text-text truncate group-hover:text-accent">
                  {item.title}
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-panel text-muted border border-border shrink-0">
                {item.tag}
              </span>
            </div>
            <span className="text-xs text-muted line-clamp-2 leading-relaxed">
              &ldquo;{item.prompt}&rdquo;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
