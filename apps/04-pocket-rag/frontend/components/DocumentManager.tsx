'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  Download,
} from 'lucide-react';
import { DocumentItem, ExampleDocument, downloadExampleDocument } from '../lib/api';

interface DocumentManagerProps {
  documents: DocumentItem[];
  isUploading: boolean;
  isLocked: boolean;
  onUpload: (file: File) => Promise<void>;
  onDeleteDoc?: (docId: string) => Promise<void>;
  onClearAll: () => Promise<void>;
  mode: 'uploads' | 'examples';
  examples: ExampleDocument[];
  isLoadingExamples: boolean;
  onModeChange: (mode: 'uploads' | 'examples') => Promise<void>;
  onLoadExamples: () => Promise<void>;
  labels: Record<string, string>;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  isUploading,
  isLocked,
  onUpload,
  onDeleteDoc,
  onClearAll,
  mode,
  examples,
  isLoadingExamples,
  onModeChange,
  onLoadExamples,
  labels,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      await onUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading || isLocked || deletingId) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      await onUpload(file);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!onDeleteDoc || deletingId) return;
    setDeletingId(documentId);
    setErrorMsg(null);
    try {
      await onDeleteDoc(documentId);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm(labels.clearConfirm || 'Delete all documents?')) return;
    setDeletingId('all');
    setErrorMsg(null);
    try {
      await onClearAll();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadExamples = async () => {
    setErrorMsg(null);
    try {
      await onLoadExamples();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed);
    }
  };

  const handleDownload = async (filename: string) => {
    setErrorMsg(null);
    try {
      await downloadExampleDocument(filename);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-panel p-4 sm:p-5 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-sky-500 dark:text-sky-400" />
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider">
            {labels.docManagerTitle || 'Document Knowledge Base'}
          </h2>
        </div>
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-300">
          {documents.length} docs
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2" role="group" aria-label={labels.documentModeLabel}>
        <button type="button" onClick={() => void onModeChange('uploads')} disabled={isLocked || isLoadingExamples} className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${mode === 'uploads' ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300' : 'border-border text-muted hover:bg-surface/50'}`}>
          {labels.myDocuments}
        </button>
        <button type="button" onClick={() => void handleLoadExamples()} disabled={isLocked || isLoadingExamples} className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-60 ${mode === 'examples' ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300' : 'border-border text-muted hover:bg-surface/50'}`}>
          {isLoadingExamples ? labels.loadingExamples : labels.tryExamples}
        </button>
      </div>

      {mode === 'uploads' ? (
        <p className="rounded-lg border border-border bg-surface/30 p-3 text-[11px] leading-relaxed text-muted">{labels.privacyNotice}</p>
      ) : (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-800 dark:text-amber-200">{labels.exampleDisclaimer}</p>
      )}

      {/* Upload Zone */}
      {mode === 'uploads' && <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/30 p-6 text-center transition hover:border-sky-500 hover:bg-surface/60 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isUploading || isLocked || Boolean(deletingId)}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-sky-500 dark:text-sky-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-xs font-medium">{labels.uploading}</p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-text">
              {labels.uploadButton}
            </p>
            <p className="mt-1 text-[11px] text-muted">
              {labels.dragDropHint}
            </p>
          </>
        )}
      </label>}

      {errorMsg && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Documents List */}
      <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
        {documents.length === 0 ? (
          <div className="rounded-lg border border-border/60 bg-surface/20 p-4 text-center text-xs text-muted">
            {labels.noDocs}
          </div>
        ) : (
          documents.map((doc) => {
            const example = examples.find((item) => item.id === doc.id);
            return (
            <div
              key={doc.id}
              className="group flex items-center justify-between rounded-lg border border-border bg-surface/40 p-2.5 transition hover:border-border/80"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText className="h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400" />
                <div className="truncate">
                  <p className="truncate text-xs font-medium text-text">
                    {example?.title || doc.filename}
                  </p>
                  {example && <p className="mt-1 text-[10px] text-muted">{example.description}</p>}
                  <p className="text-[10px] text-muted">
                    {doc.file_type} • {doc.chunks_count} chunks • {(doc.file_size_bytes / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {doc.source === 'example' ? (
                  <button type="button" onClick={() => void handleDownload(doc.filename)} aria-label={`${labels.downloadExample}: ${example?.title || doc.filename}`} className="icon-button shrink-0">
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : onDeleteDoc && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(doc.id);
                    }}
                    disabled={Boolean(deletingId)}
                    className="p-1 rounded text-muted hover:text-red-500 hover:bg-surface transition cursor-pointer"
                    title={labels.deleteDocument || 'Delete document'}
                    aria-label={`${labels.deleteDocument || 'Delete document'}: ${doc.filename}`}
                  >
                    {deletingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                )}
                {doc.source === 'upload' && <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />}
              </div>
            </div>
          )})
        )}
      </div>

      {mode === 'uploads' && documents.length > 0 && (
        <button
          onClick={handleClear}
          disabled={Boolean(deletingId) || isUploading || isLocked}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {labels.clearAll}
        </button>
      )}
    </div>
  );
};
