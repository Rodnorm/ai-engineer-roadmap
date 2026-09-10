'use client';

import React from 'react';
import { Calculator, BookOpen, ShieldAlert } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickPrompts({ onSelectPrompt, disabled }: QuickPromptsProps) {
  const prompts = [
    {
      icon: <Calculator className="w-4 h-4 text-sky-400" />,
      title: 'Math Calculator',
      prompt: 'Calcule quanto é (45 * 12) + 230 para o orçamento.',
      tag: 'calculator',
    },
    {
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      title: 'Policy Search',
      prompt: 'Qual a política de reembolso (refund policy) da empresa?',
      tag: 'knowledge_search',
    },
    {
      icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
      title: 'Dispatch Alert (HITL)',
      prompt: 'Envie um alerta urgente para @ops-team avisando sobre alta latência na API.',
      tag: 'send_alert (HITL)',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="text-xs uppercase font-semibold tracking-wider text-slate-500">
        Suggested Tasks:
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {prompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            disabled={disabled}
            className="flex flex-col items-start text-left p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-medium text-xs text-slate-200 group-hover:text-sky-300">
                  {item.title}
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {item.tag}
              </span>
            </div>
            <span className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              &ldquo;{item.prompt}&rdquo;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
