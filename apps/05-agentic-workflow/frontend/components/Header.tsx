'use client';

import React from 'react';
import { RotateCcw, Cpu } from 'lucide-react';
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
    <header className="border-b border-border pb-5 space-y-3.5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xs border border-accent bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Cpu className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-accent">{"//"} SCADA_MISSION_CONTROL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
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
              className="control-button gap-1.5 px-2.5 text-xs font-mono cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>[ {t('resetButton')} ]</span>
            </button>
          )}

          <ThemeToggle />
          <LangSwitcher />
          <AppInfo />
        </div>
      </div>

      <p className="text-xs text-muted leading-relaxed max-w-2xl">
        {t('subtitle')}
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5 font-mono text-[0.65rem]">
        <span className="px-2 py-0.5 rounded-xs bg-surface border border-border text-muted uppercase">
          {t('loopBadge')}
        </span>
        <span className="px-2 py-0.5 rounded-xs bg-surface border border-border text-muted uppercase">
          {t('toolsBadge')}
        </span>
        <span className="px-2 py-0.5 rounded-xs bg-amber-500/10 border border-amber-500/30 text-amber-500 uppercase">
          {t('hitlBadge')}
        </span>
      </div>
    </header>
  );
}
