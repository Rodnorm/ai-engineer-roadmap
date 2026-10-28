'use client';

import React from 'react';
import { SystemStats } from '../lib/api';

interface TelemetryBarProps {
  stats: SystemStats | null;
  lastCost: number;
  lastTokens: number;
  lastLatency: number;
  labels: Record<string, string>;
  isBusy?: boolean;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  stats,
  lastCost,
  lastTokens,
  lastLatency,
  labels,
  isBusy = false,
}) => {
  return (
    <footer className="sticky bottom-0 z-30 w-full border-t border-border bg-panel text-[11px] font-mono text-terminal select-none">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-3 py-1.5 sm:px-6">
        {/* Left Status & Engine Info */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-surface px-2 py-0.5 border border-border">
            <span
              className={`h-2 w-2 rounded-full ${
                isBusy ? 'bg-amber-400 animate-ping' : 'bg-accent'
              }`}
            />
            <span className="font-bold text-text">
              {isBusy ? '[STATUS: BUSY]' : '[STATUS: READY]'}
            </span>
          </div>

          <div className="hidden items-center gap-1 sm:flex text-muted">
            <span>EMBEDDINGS:</span>
            <span className="text-text font-medium">1536-dim</span>
          </div>

          <span className="hidden text-border sm:inline">|</span>

          <div className="flex items-center gap-1">
            <span className="text-muted">STORE:</span>
            <span className="text-text font-medium">{stats?.vector_store_type || 'SQLITE'}</span>
          </div>

          <span className="hidden text-border sm:inline">|</span>

          <div className="flex items-center gap-1">
            <span className="text-muted">DOCS:</span>
            <span className="text-accent font-semibold">{stats?.total_documents ?? 0}</span>
          </div>
        </div>

        {/* Right Query Metrics (VIM statusline style) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <span className="text-muted">TOKENS:</span>
            <span className="text-text font-semibold">{lastTokens.toLocaleString()}</span>
          </div>

          <span className="text-border">|</span>

          <div className="flex items-center gap-1">
            <span className="text-muted">LATENCY:</span>
            <span className="text-text font-semibold">
              {lastLatency > 0 ? `${lastLatency}ms` : '--'}
            </span>
          </div>

          <span className="text-border">|</span>

          <div className="flex items-center gap-1 bg-surface px-2 py-0.5 border border-border">
            <span className="text-muted">COST:</span>
            <span className="text-accent font-bold">${lastCost.toFixed(5)}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};