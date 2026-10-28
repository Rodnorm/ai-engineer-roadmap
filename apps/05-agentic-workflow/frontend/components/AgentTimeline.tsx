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
        return <Brain className="size-3.5 text-accent" />;
      case 'tool_call':
        return <Wrench className="size-3.5 text-indigo-400" />;
      case 'tool_result':
        return <Terminal className="size-3.5 text-emerald-400" />;
      case 'waiting_approval':
        return <AlertTriangle className="size-3.5 text-amber-500" />;
      case 'answer':
        return <CheckCircle2 className="size-3.5 text-emerald-400" />;
      case 'error':
        return <XCircle className="size-3.5 text-rose-500" />;
      default:
        return <HelpCircle className="size-3.5 text-muted" />;
    }
  };

  const getStepPrefix = (type: string, index: number) => {
    const formatted = index.toString().padStart(2, '0');
    switch (type) {
      case 'thought':
        return `[T-${formatted}] THOUGHT`;
      case 'tool_call':
        return `[A-${formatted}] ACTION / TOOL_CALL`;
      case 'tool_result':
        return `[O-${formatted}] OBSERVATION`;
      case 'waiting_approval':
        return `[H-${formatted}] HUMAN_IN_THE_LOOP`;
      case 'answer':
        return `[F-${formatted}] FINAL_ANSWER`;
      case 'error':
        return `[E-${formatted}] FAULT`;
      default:
        return `[S-${formatted}] STEP`;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'thought':
        return 'text-accent border-accent/40 bg-accent/10';
      case 'tool_call':
        return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
      case 'tool_result':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'waiting_approval':
        return 'text-amber-500 border-amber-500/40 bg-amber-500/10';
      case 'answer':
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/15';
      case 'error':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      default:
        return 'text-muted border-border bg-surface';
    }
  };

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
          <span>{"//"} {t('title')}</span>
          <span className="px-1.5 py-0.5 rounded-xs text-[10px] bg-surface text-muted border border-border">
            {steps.length === 1 ? t('step') : t('steps', { count: steps.length })}
          </span>
        </h3>
        {isThinking && (
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent transition-opacity duration-300">
            <span className="inline-block size-1.5 rounded-full bg-accent animate-ping" />
            {t('thinking')}
          </span>
        )}
      </div>

      <div className="relative border-l border-border ml-3 pl-5 space-y-4">
        {steps.map((step) => {
          const isFinal = step.type === 'answer';

          return (
            <div key={step.step_index} className="relative group animate-fade-to-light">
              {/* Step indicator node */}
              <div className="absolute -left-[27px] top-2 rounded-xs p-1 bg-panel border border-border">
                {getStepIcon(step.type)}
              </div>

              <div
                className={`rounded-xs border p-3.5 space-y-2 transition-colors ${
                  isFinal
                    ? 'bg-emerald-500/5 border-emerald-500/40'
                    : 'bg-panel border-border hover:border-accent/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border uppercase tracking-wider ${getBadgeStyle(
                        step.type
                      )}`}
                    >
                      {getStepPrefix(step.type, step.step_index)}
                    </span>
                    {step.tool_name && (
                      <span className="px-1.5 py-0.5 rounded-xs text-[10px] bg-surface text-accent border border-border">
                        {step.tool_name}()
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted">{step.title}</span>
                </div>

                <div className="text-xs text-text leading-relaxed whitespace-pre-wrap font-sans">
                  {step.content}
                </div>

                {step.tool_args && (
                  <div className="rounded-xs bg-surface border border-border p-2.5 text-[11px] text-text overflow-x-auto">
                    <span className="text-muted text-[9px] uppercase font-mono font-semibold block mb-1">
                      {"//"} {t('toolArgs')}
                    </span>
                    <pre className="font-mono">{JSON.stringify(step.tool_args, null, 2)}</pre>
                  </div>
                )}

                {step.tool_result && (
                  <div className="rounded-xs bg-emerald-500/5 border border-emerald-500/30 p-2.5 text-[11px] text-emerald-700 dark:text-emerald-300 overflow-x-auto">
                    <span className="text-emerald-600 dark:text-emerald-400 text-[9px] uppercase font-mono font-semibold block mb-1">
                      {"//"} {t('toolOutput')}
                    </span>
                    <div className="font-mono whitespace-pre-wrap">{step.tool_result}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
