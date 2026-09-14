'use client';

import React from 'react';
import { Bot, RotateCcw } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LangSwitcher } from './LangSwitcher';
import { AppInfo } from './AppInfo';
import { useT } from '@/lib/i18n/I18nProvider';

interface HeaderProps {
  hasSteps: boolean;
  onReset: () => void;
}

export function Header({ hasSteps, onReset }: HeaderProps) {
  const t = useT('app');

  return (
    <header className="border-b border-border pb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 shrink-0">
            <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-accent-soft text-accent-strong border border-accent/20">
                {t('badge')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-surface text-muted border border-border">
                {t('port')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text mt-1">
              {t('title')}
            </h1>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasSteps && (
            <button
              type="button"
              onClick={onReset}
              className="control-button gap-1.5 px-3 text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">{t('resetButton')}</span>
            </button>
          )}

          <ThemeToggle />
          <LangSwitcher />
          <AppInfo />
        </div>
      </div>

      <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-2xl">
        {t('subtitle')}
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="px-2.5 py-1 rounded-lg bg-surface border border-border text-muted font-medium">
          {t('loopBadge')}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-surface border border-border text-muted font-medium">
          {t('toolsBadge')}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-medium">
          {t('hitlBadge')}
        </span>
      </div>
    </header>
  );
}
