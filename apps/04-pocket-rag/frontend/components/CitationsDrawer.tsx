'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X, FileText, Sparkles } from 'lucide-react';
import { Citation } from '../lib/api';

interface CitationsDrawerProps {
  citation: Citation | null;
  onClose: () => void;
  labels: Record<string, string>;
}

export const CitationsDrawer: React.FC<CitationsDrawerProps> = ({
  citation,
  onClose,
  labels,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (citation && dialog && !dialog.open) dialog.showModal();
    if (!citation && dialog?.open) dialog.close();
  }, [citation]);

  if (!citation) return null;

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} className="fixed inset-0 z-50 m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-transparent p-0 backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col border-l border-border bg-panel p-6 shadow-2xl text-text">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            <h3 id={titleId} className="text-sm font-bold text-text">
              {labels.citationSource || 'Citation source'} [{citation.citation_id}]
            </h3>
          </div>
          <button
            onClick={() => dialogRef.current?.close()}
            type="button"
            aria-label={labels.close || 'Close'}
            className="rounded-lg p-1 text-muted hover:bg-surface hover:text-text cursor-pointer transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 overflow-y-auto flex-1">
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">{labels.document || 'Document'}</p>
            <p className="text-sm font-medium text-sky-600 dark:text-sky-300 mt-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              {citation.filename}
            </p>
            {citation.page_number && (
              <p className="text-xs text-muted mt-1">{labels.page || 'Page'} {citation.page_number}</p>
            )}
            <p className="text-xs text-muted mt-1">{labels.chunk || 'Chunk'} {citation.chunk_index + 1}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">{labels.similarity || 'Vector similarity'}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(citation.similarity_score * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {(citation.similarity_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              {labels.contextChunk || 'Extracted context chunk'}
            </p>
            <p className="text-xs text-text leading-relaxed font-mono whitespace-pre-wrap bg-surface/60 p-3 rounded-lg border border-border">
              {citation.snippet}
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
};
