'use client';

import React from 'react';
import { DollarSign, Clock, Hash, Database } from 'lucide-react';
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-border bg-panel p-4 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
            {labels.vectorDb || 'Vector Store'}
          </p>
          <p className="text-xs font-bold text-text">
            {stats?.vector_store_type || 'SQLite Vector'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <DollarSign className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
            {labels.cost || 'Est. Cost'}
          </p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ${lastCost.toFixed(5)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
          <Hash className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
            {labels.tokens || 'Tokens'}
          </p>
          <p className="text-xs font-bold text-text">{lastTokens}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
            {labels.latency || 'Latency'}
          </p>
          <p className="text-xs font-bold text-purple-600 dark:text-purple-300">
            {lastLatency > 0 ? `${lastLatency} ms` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};
