'use client';

import React from 'react';
import { X, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { Citation } from '../lib/api';

interface CitationsDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationsDrawer: React.FC<CitationsDrawerProps> = ({
  citation,
  onClose,
}) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="flex w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-400" />
            <h3 className="text-sm font-bold">
              Citation Source [{citation.citation_id}]
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 overflow-y-auto flex-1">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document</p>
            <p className="text-sm font-medium text-sky-300 mt-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-400" />
              {citation.filename}
            </p>
            {citation.page_number && (
              <p className="text-xs text-slate-400 mt-1">Page {citation.page_number}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vector Similarity Match</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.min(citation.similarity_score * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {(citation.similarity_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Extracted Context Chunk
            </p>
            <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap bg-slate-900 p-3 rounded-lg border border-slate-800">
              {citation.snippet}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
