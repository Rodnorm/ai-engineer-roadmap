'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  Receipt,
  BookOpen,
  Server,
  PhoneCall,
  Database,
  ShieldAlert,
  Mail,
  BellOff,
} from 'lucide-react';
import { useT } from '@/lib/i18n/I18nProvider';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

type CategoryType = 'all' | 'math' | 'knowledge' | 'alert';

export function QuickPrompts({ onSelectPrompt, disabled }: QuickPromptsProps) {
  const t = useT('prompts');
  const [category, setCategory] = useState<CategoryType>('all');

  const prompts = [
    // Math category
    {
      id: 'math',
      category: 'math' as const,
      icon: <Calculator className="size-3.5 text-accent shrink-0" />,
      title: t('mathTitle'),
      prompt: t('mathPrompt'),
      tag: t('mathTag'),
      borderHover: 'hover:border-accent/60',
    },
    {
      id: 'tax',
      category: 'math' as const,
      icon: <Percent className="size-3.5 text-accent shrink-0" />,
      title: t('taxTitle'),
      prompt: t('taxPrompt'),
      tag: t('taxTag'),
      borderHover: 'hover:border-accent/60',
    },
    {
      id: 'reimburse',
      category: 'math' as const,
      icon: <Receipt className="size-3.5 text-accent shrink-0" />,
      title: t('reimburseTitle'),
      prompt: t('reimbursePrompt'),
      tag: t('reimburseTag'),
      borderHover: 'hover:border-accent/60',
    },

    // Knowledge & Policies category
    {
      id: 'policy',
      category: 'knowledge' as const,
      icon: <BookOpen className="size-3.5 text-emerald-400 shrink-0" />,
      title: t('policyTitle'),
      prompt: t('policyPrompt'),
      tag: t('policyTag'),
      borderHover: 'hover:border-emerald-500/60',
    },
    {
      id: 'sla',
      category: 'knowledge' as const,
      icon: <Server className="size-3.5 text-emerald-400 shrink-0" />,
      title: t('slaTitle'),
      prompt: t('slaPrompt'),
      tag: t('slaTag'),
      borderHover: 'hover:border-emerald-500/60',
    },
    {
      id: 'oncall',
      category: 'knowledge' as const,
      icon: <PhoneCall className="size-3.5 text-indigo-400 shrink-0" />,
      title: t('oncallTitle'),
      prompt: t('oncallPrompt'),
      tag: t('oncallTag'),
      borderHover: 'hover:border-indigo-500/60',
    },
    {
      id: 'infra',
      category: 'knowledge' as const,
      icon: <Database className="size-3.5 text-indigo-400 shrink-0" />,
      title: t('infraTitle'),
      prompt: t('infraPrompt'),
      tag: t('infraTag'),
      borderHover: 'hover:border-indigo-500/60',
    },

    // Alerts / HITL category
    {
      id: 'alert',
      category: 'alert' as const,
      icon: <ShieldAlert className="size-3.5 text-amber-500 shrink-0" />,
      title: t('alertTitle'),
      prompt: t('alertPrompt'),
      tag: t('alertTag'),
      borderHover: 'hover:border-amber-500/60',
    },
    {
      id: 'redButton',
      category: 'alert' as const,
      icon: <Mail className="size-3.5 text-rose-400 shrink-0" />,
      title: t('redButtonTitle'),
      prompt: t('redButtonPrompt'),
      tag: t('redButtonTag'),
      borderHover: 'hover:border-rose-500/60',
    },
    {
      id: 'cancel',
      category: 'alert' as const,
      icon: <BellOff className="size-3.5 text-amber-500 shrink-0" />,
      title: t('cancelTitle'),
      prompt: t('cancelPrompt'),
      tag: t('cancelTag'),
      borderHover: 'hover:border-amber-500/60',
    },
  ];

  const filtered =
    category === 'all'
      ? prompts
      : prompts.filter((item) => item.category === category);

  const filterTabs: { key: CategoryType; label: string; count: number }[] = [
    { key: 'all', label: t('filterAll'), count: prompts.length },
    {
      key: 'math',
      label: t('filterMath'),
      count: prompts.filter((p) => p.category === 'math').length,
    },
    {
      key: 'knowledge',
      label: t('filterKnowledge'),
      count: prompts.filter((p) => p.category === 'knowledge').length,
    },
    {
      key: 'alert',
      label: t('filterAlert'),
      count: prompts.filter((p) => p.category === 'alert').length,
    },
  ];

  return (
    <div className="space-y-2.5 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <span className="text-xs uppercase font-semibold tracking-wider text-muted">
          {"//"} {t('sectionTitle')}
        </span>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {filterTabs.map((tab) => {
            const isActive = category === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategory(tab.key)}
                className={`px-2 py-1 rounded-xs text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-accent text-white border border-accent'
                    : 'bg-panel border border-border text-muted hover:text-text hover:border-border/80'
                }`}
              >
                <span>[ {tab.label} ]</span>
                <span className="text-[10px] text-muted-foreground opacity-80">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            disabled={disabled}
            className={`flex flex-col items-start text-left p-3 rounded-xs border border-border bg-panel hover:bg-surface ${item.borderHover} transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group`}
          >
            <div className="flex items-center justify-between w-full mb-1 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {item.icon}
                <span className="font-semibold text-xs text-text truncate group-hover:text-accent">
                  <span className="text-muted text-[10px] mr-1">SCENARIO_{idx + 1}:</span>
                  {item.title}
                </span>
              </div>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-xs bg-surface text-muted border border-border shrink-0">
                {item.tag}
              </span>
            </div>
            <span className="text-xs text-muted line-clamp-2 leading-relaxed font-sans mt-0.5">
              &ldquo;{item.prompt}&rdquo;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
