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

interface AgentTimelineProps {
  steps: AgentStep[];
}

export function AgentTimeline({ steps }: AgentTimelineProps) {
  if (steps.length === 0) return null;

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'thought':
        return <Brain className="w-4 h-4 text-sky-400" />;
      case 'tool_call':
        return <Wrench className="w-4 h-4 text-indigo-400" />;
      case 'tool_result':
        return <Terminal className="w-4 h-4 text-emerald-400" />;
      case 'waiting_approval':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'answer':
        return <CheckCircle2 className="w-4 h-4 text-emerald-300" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'thought':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'tool_call':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'tool_result':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'waiting_approval':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'answer':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <span>Execution Timeline</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
          {steps.length} {steps.length === 1 ? 'step' : 'steps'}
        </span>
      </h3>

      <div className="relative border-l-2 border-slate-800 ml-3.5 pl-6 space-y-6">
        {steps.map((step) => {
          const isFinal = step.type === 'answer';

          return (
            <div key={step.step_index} className="relative group">
              {/* Step indicator circle */}
              <div className="absolute -left-[33px] top-1 rounded-full p-1.5 bg-slate-900 border border-slate-700 shadow-md">
                {getStepIcon(step.type)}
              </div>

              <div
                className={`rounded-2xl border p-4 space-y-2 transition-all ${
                  isFinal
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">#{step.step_index}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${getBadgeStyle(
                        step.type
                      )}`}
                    >
                      {step.type.replace('_', ' ')}
                    </span>
                    {step.tool_name && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-slate-800 text-indigo-300 border border-slate-700">
                        {step.tool_name}()
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{step.title}</span>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {step.content}
                </div>

                {step.tool_args && (
                  <div className="rounded-lg bg-black/50 border border-slate-800 p-2.5 font-mono text-xs text-indigo-200 overflow-x-auto">
                    <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold block mb-0.5">
                      Tool Arguments:
                    </span>
                    <pre>{JSON.stringify(step.tool_args, null, 2)}</pre>
                  </div>
                )}

                {step.tool_result && (
                  <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/50 p-2.5 font-mono text-xs text-emerald-300 overflow-x-auto">
                    <span className="text-emerald-500/70 text-[10px] uppercase font-sans font-semibold block mb-0.5">
                      Tool Output:
                    </span>
                    <div>{step.tool_result}</div>
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
