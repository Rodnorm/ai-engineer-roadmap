'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X, FileText, Terminal } from 'lucide-react';
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
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="fixed inset-0 z-50 m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-transparent p-0 backdrop:bg-black/75 font-mono"
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-panel p-5 text-text shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-accent" />
            <h3 id={titleId} className="text-xs font-bold text-text uppercase tracking-wider">
              {'// CITATION_INSPECTOR'} [{citation.citation_id}]
            </h3>
          </div>
          <button
            onClick={() => dialogRef.current?.close()}
            type="button"
            aria-label={labels.close || 'Close'}
            className="border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted hover:text-text hover:border-border-focus cursor-pointer"
          >
            [ESC]
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-col gap-3 overflow-y-auto flex-1 text-xs">
          {/* File Meta */}
          <div className="border border-border bg-surface/50 p-3">
            <span className="text-[10px] uppercase text-muted tracking-wider">
              {labels.document || 'SOURCE_FILE'}
            </span>
            <p className="text-xs font-bold text-accent mt-1 flex items-center gap-1.5 break-all">
              <FileText className="h-3.5 w-3.5 shrink-0 text-accent" />
              {citation.filename}
            </p>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-muted">
              {citation.page_number && (
                <span>PAGE: {citation.page_number}</span>
              )}
              <span>CHUNK_INDEX: {citation.chunk_index + 1}</span>
            </div>
          </div>

          {/* Vector Similarity Score */}
          <div className="border border-border bg-surface/50 p-3">
            <div className="flex items-center justify-between text-[10px] uppercase text-muted">
              <span>{labels.similarity || 'COSINE_SIMILARITY'}</span>
              <span className="font-bold text-accent">
                {(citation.similarity_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-bg border border-border">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${Math.min(citation.similarity_score * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Extracted Chunk Content */}
          <div className="border border-border bg-surface/50 p-3 flex-1 flex flex-col">
            <span className="text-[10px] uppercase text-muted tracking-wider mb-2">
              {labels.contextChunk || '// EXTRACTED_CONTEXT_CHUNK'}
            </span>
            <div className="flex-1 overflow-y-auto border border-border bg-bg p-3 text-[11px] leading-relaxed text-text font-mono whitespace-pre-wrap selection:bg-accent/30">
              {citation.snippet}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};
