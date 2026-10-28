'use client';

import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';
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
    <div className="rounded-xs border-2 border-amber-500/80 bg-hitl p-4 sm:p-5 shadow-lg space-y-4 font-mono animate-fade-to-light">
      <div className="flex items-start gap-3 border-b border-amber-500/30 pb-3">
        <div className="size-8 rounded-xs bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
          <ShieldAlert className="size-4.5 animate-pulse" />
        </div>
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              [!] AIR-GAP INTERVENTION: {t('title')}
            </span>
            <span className="px-2 py-0.5 rounded-xs text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              TOOL: {pending.tool_name}()
            </span>
          </div>
          <p className="text-[11px] text-muted font-sans">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="rounded-xs bg-panel border border-border p-3 text-xs text-text overflow-x-auto">
        <div className="text-amber-500 text-[10px] uppercase font-bold mb-1 tracking-wider">
          {"//"} {t('payloadTitle')}
        </div>
        <pre className="text-[11px] text-text font-mono leading-relaxed">{JSON.stringify(pending.tool_args, null, 2)}</pre>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onReject('Declined by operator')}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xs text-xs font-medium uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          <X className="size-3.5" />
          <span>[ ✗ {t('rejectButton')} ]</span>
        </button>

        <button
          type="button"
          onClick={onApprove}
          disabled={isLoading}
          className="px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-500 border border-amber-400/50 shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          <Check className="size-3.5" />
          <span>[ ✓ {isLoading ? t('authorizing') : t('approveButton')} ]</span>
        </button>
      </div>
    </div>
  );
}
