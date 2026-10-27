'use client';

import React from 'react';
import { Database, Coins, Cpu, Zap, Activity } from 'lucide-react';
import { SystemStats } from '../lib/api';

interface TelemetryBarProps {
  stats: SystemStats | null;
  lastCost: number;
  lastTokens: number;
  lastLatency: number;
  labels: Record<string, string>;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  stats,
  lastCost,
  lastTokens,
  lastLatency,
  labels,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-panel/70 px-3.5 py-2 backdrop-blur-md text-xs shadow-xs">
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        {/* Vector DB Engine */}
        <div className="flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="text-[11px] text-muted">{labels.vectorDb || 'Vector Store'}:</span>
          <span className="font-mono text-[11px] font-semibold text-text">
            {stats?.vector_store_type || 'SQLite Vector'}
          </span>
        </div>

        <div className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />

        {/* Cost */}
        <div className="flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
          <span className="text-[11px] text-muted">{labels.cost || 'Cost'}:</span>
          <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            ${lastCost.toFixed(5)}
          </span>
        </div>

        <div className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />

        {/* Tokens */}
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
          <span className="text-[11px] text-muted">{labels.tokens || 'Tokens'}:</span>
          <span className="font-mono text-[11px] font-semibold text-text">
            {lastTokens.toLocaleString()}
          </span>
        </div>

        <div className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />

        {/* Latency */}
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" aria-hidden="true" />
          <span className="text-[11px] text-muted">{labels.latency || 'Latency'}:</span>
          <span className="font-mono text-[11px] font-semibold text-text">
            {lastLatency > 0 ? `${lastLatency}ms` : '—'}
          </span>
        </div>
      </div>

      {/* Connection & Status Pill */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/60 px-2.5 py-0.5 text-[10px] font-medium text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          {stats?.total_documents !== undefined
            ? `${stats.total_documents} ${stats.total_documents === 1 ? 'doc' : 'docs'}`
            : (labels.connected || 'Ready')}
        </span>
      </div>
    </div>
  );
};