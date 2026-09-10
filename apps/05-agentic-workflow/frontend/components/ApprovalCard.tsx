'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { PendingApproval } from '@/lib/api';

interface ApprovalCardProps {
  pending: PendingApproval;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  isLoading: boolean;
}

export function ApprovalCard({ pending, onApprove, onReject, isLoading }: ApprovalCardProps) {
  return (
    <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-6 backdrop-blur-sm shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-amber-200 flex items-center gap-2">
              Human-in-the-Loop: Authorization Required
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Tool: {pending.tool_name}
            </span>
          </div>
          <p className="text-sm text-amber-300/80">
            The agent paused execution before dispatching a sensitive action. Please review arguments below.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-black/40 border border-amber-500/20 p-4 font-mono text-xs text-amber-100 overflow-x-auto">
        <div className="text-amber-400/80 font-sans text-xs font-semibold mb-1">Payload Arguments:</div>
        <pre>{JSON.stringify(pending.tool_args, null, 2)}</pre>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => onReject('Declined by user')}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-sm font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          Reject Action
        </button>

        <button
          type="button"
          onClick={onApprove}
          disabled={isLoading}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer font-semibold"
        >
          <CheckCircle className="w-4 h-4" />
          {isLoading ? 'Authorizing...' : 'Authorize & Resume'}
        </button>
      </div>
    </div>
  );
}
