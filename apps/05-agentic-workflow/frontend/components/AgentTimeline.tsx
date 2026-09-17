'use client';

import React from 'react';
import {
  Brain,
  Wrench,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { AgentStep } from '@/lib/api';
import { useT } from '@/lib/i18n/I18nProvider';

interface AgentTimelineProps {
  steps: AgentStep[];
  isThinking?: boolean;
}

export function AgentTimeline({ steps, isThinking }: AgentTimelineProps) {
  const t = useT('timeline');
  if (steps.length === 0) return null;

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'thought':
        return <Brain className="w-4 h-4 text-sky-500" />;
      case 'tool_call':
        return <Wrench className="w-4 h-4 text-indigo-500" />;
      case 'tool_result':
        return <Terminal className="w-4 h-4 text-emerald-500" />;
      case 'waiting_approval':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'answer':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-muted" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'thought':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
      case 'tool_call':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'tool_result':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'waiting_approval':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'answer':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-surface text-muted border-border';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
        <span>{t('title')}</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-surface text-muted border border-border">
          {steps.length === 1 ? t('step') : t('steps', { count: steps.length })}
        </span>
      </h3>

      <div className="relative border-l-2 border-border ml-3.5 pl-6 space-y-5">
        {steps.map((step) => {
          const isFinal = step.type === 'answer';

          return (
            <div key={step.step_index} className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Step indicator circle */}
              <div className="absolute -left-[33px] top-1 rounded-full p-1.5 bg-panel border border-border shadow-xs">
                {getStepIcon(step.type)}
              </div>

              <div
                className={`rounded-2xl border p-4 space-y-2.5 transition-all shadow-xs ${
                  isFinal
                    ? 'bg-emerald-500/5 border-emerald-500/40 shadow-emerald-500/10'
                    : 'bg-panel border-border hover:border-sky-500/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted">#{step.step_index}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${getBadgeStyle(
                        step.type
                      )}`}
                    >
                      {step.type.replace('_', ' ')}
                    </span>
                    {step.tool_name && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-surface text-accent-strong border border-border">
                        {step.tool_name}()
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted font-medium">{step.title}</span>
                </div>

                <div className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                  {step.content}
                </div>

                {step.tool_args && (
                  <div className="rounded-xl bg-surface border border-border p-3 font-mono text-xs text-text overflow-x-auto">
                    <span className="text-muted text-[10px] uppercase font-sans font-semibold block mb-1">
                      {t('toolArgs')}
                    </span>
                    <pre>{JSON.stringify(step.tool_args, null, 2)}</pre>
                  </div>
                )}

                {step.tool_result && (
                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/30 p-3 font-mono text-xs text-emerald-800 dark:text-emerald-300 overflow-x-auto">
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-sans font-semibold block mb-1">
                      {t('toolOutput')}
                    </span>
                    <div>{step.tool_result}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="relative group animate-in fade-in duration-300">
            <div className="absolute -left-[33px] top-1 rounded-full p-1.5 bg-panel border border-border shadow-xs">
              <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
            </div>
            <div className="rounded-2xl border border-dashed border-sky-500/30 bg-sky-500/5 p-4 flex items-center gap-2.5 text-xs text-sky-600 dark:text-sky-400 font-medium animate-pulse">
              <span>{t('thinking')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
