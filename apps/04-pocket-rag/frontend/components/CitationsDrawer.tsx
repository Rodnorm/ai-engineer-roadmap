'use client';

import React from 'react';
import { X, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { Citation, getExampleDownloadUrl } from '../lib/api';

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
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="flex w-full max-w-md flex-col border-l border-border bg-panel p-6 shadow-2xl text-text">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-text">
              Citation Source [{citation.citation_id}]
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface hover:text-text cursor-pointer transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 overflow-y-auto flex-1">
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Document</p>
            <p className="text-sm font-medium text-sky-600 dark:text-sky-300 mt-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              {citation.filename}
            </p>
            {citation.page_number && (
              <p className="text-xs text-muted mt-1">Page {citation.page_number}</p>
            )}
            {citation.source === 'example' && (
              <a
                href={getExampleDownloadUrl(citation.filename)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-xs font-medium text-sky-600 hover:underline dark:text-sky-300"
              >
                {labels.openSourcePdf}
              </a>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Vector Similarity Match</p>
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
              Extracted Context Chunk
            </p>
            <p className="text-xs text-text leading-relaxed font-mono whitespace-pre-wrap bg-surface/60 p-3 rounded-lg border border-border">
              {citation.snippet}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
