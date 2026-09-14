'use client';

import React from 'react';
import { CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { PendingApproval } from '@/lib/api';
import { useT } from '@/lib/i18n/I18nProvider';

interface ApprovalCardProps {
  pending: PendingApproval;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  isLoading: boolean;
}

export function ApprovalCard({ pending, onApprove, onReject, isLoading }: ApprovalCardProps) {
  const t = useT('approval');

  return (
    <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-4 sm:p-6 backdrop-blur-xs shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 shrink-0">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-base sm:text-lg text-text flex items-center gap-2">
              {t('title')}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
              Tool: {pending.tool_name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-surface border border-border p-3.5 font-mono text-xs text-text overflow-x-auto">
        <div className="text-amber-600 dark:text-amber-400 font-sans text-xs font-semibold mb-1">
          {t('payloadTitle')}
        </div>
        <pre>{JSON.stringify(pending.tool_args, null, 2)}</pre>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={() => onReject('Declined by user')}
          disabled={isLoading}
          className="min-h-10 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          {t('rejectButton')}
        </button>

        <button
          type="button"
          onClick={onApprove}
          disabled={isLoading}
          className="min-h-10 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 shadow-md shadow-emerald-900/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          {isLoading ? t('authorizing') : t('approveButton')}
        </button>
      </div>
    </div>
  );
}
