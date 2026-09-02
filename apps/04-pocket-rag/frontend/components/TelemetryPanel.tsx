'use client';

import React from 'react';
import { Cpu, DollarSign, Clock, Hash, Database, ShieldCheck } from 'lucide-react';
import { SystemStats } from '../lib/api';

interface TelemetryPanelProps {
  stats: SystemStats | null;
  lastCost: number;
  lastTokens: number;
  lastLatency: number;
  labels: Record<string, string>;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  stats,
  lastCost,
  lastTokens,
  lastLatency,
  labels,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {labels.vectorDb || 'Vector Store'}
          </p>
          <p className="text-xs font-bold text-slate-200">
            {stats?.vector_store_type || 'ChromaDB Local'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
          <DollarSign className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {labels.cost || 'Est. Cost'}
          </p>
          <p className="text-xs font-bold text-emerald-400">
            ${lastCost.toFixed(5)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          <Hash className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {labels.tokens || 'Tokens'}
          </p>
          <p className="text-xs font-bold text-slate-200">{lastTokens}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {labels.latency || 'Latency'}
          </p>
          <p className="text-xs font-bold text-purple-300">
            {lastLatency > 0 ? `${lastLatency} ms` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};
