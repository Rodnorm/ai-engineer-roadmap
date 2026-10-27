'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Folder,
  X,
  Loader2,
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

function getFileTypeBadge(filename: string, fileType: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || fileType.toLowerCase();
  switch (ext) {
    case 'pdf':
      return { label: 'PDF', badgeClass: 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30' };
    case 'md':
    case 'markdown':
      return { label: 'MD', badgeClass: 'bg-sky-500/15 text-sky-500 dark:text-sky-400 border-sky-500/30' };
    case 'docx':
    case 'doc':
      return { label: 'DOC', badgeClass: 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border-indigo-500/30' };
    default:
      return { label: 'TXT', badgeClass: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30' };
  }
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
  const [isDragging, setIsDragging] = useState(false);

  // Auto-dismiss error message toast after 6 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(null), 6000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      await onUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed || 'Upload failed');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading || isLocked || deletingId) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      await onUpload(file);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed || 'Upload failed');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading && !isLocked) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDelete = async (documentId: string) => {
    if (!onDeleteDoc || deletingId) return;
    setDeletingId(documentId);
    setErrorMsg(null);
    try {
      await onDeleteDoc(documentId);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed || 'Delete failed');
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
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed || 'Clear failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadExamples = async () => {
    setErrorMsg(null);
    try {
      await onLoadExamples();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed || 'Load examples failed');
    }
  };

  const handleDownload = async (filename: string) => {
    setErrorMsg(null);
    try {
      await downloadExampleDocument(filename);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed || 'Download failed');
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-panel/80 p-4 backdrop-blur-sm shadow-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text">
            {labels.knowledgeBase || 'Knowledge Base'}
          </h2>
        </div>
        <span className="font-mono text-[11px] font-medium text-muted">
          {documents.length} {documents.length === 1 ? 'doc' : 'docs'}
        </span>
      </div>

      {/* Segmented Control (macOS / Linear style) */}
      <div className="grid grid-cols-2 rounded-xl bg-surface/70 p-1 border border-border/50 text-xs">
        <button
          type="button"
          onClick={() => void onModeChange('uploads')}
          disabled={isLocked || isLoadingExamples}
          className={`flex items-center justify-center rounded-lg py-1.5 px-3 text-[11px] font-medium transition-all duration-150 disabled:opacity-50 ${
            mode === 'uploads'
              ? 'bg-panel text-text shadow-xs border border-border/60'
              : 'text-muted hover:text-text hover:bg-surface/50'
          }`}
        >
          {labels.myDocuments || 'My documents'}
        </button>
        <button
          type="button"
          onClick={() => void handleLoadExamples()}
          disabled={isLocked || isLoadingExamples}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-[11px] font-medium transition-all duration-150 disabled:opacity-50 ${
            mode === 'examples'
              ? 'bg-panel text-text shadow-xs border border-border/60'
              : 'text-muted hover:text-text hover:bg-surface/50'
          }`}
        >
          {isLoadingExamples && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
          {isLoadingExamples ? (labels.loadingExamples || 'Loading...') : (labels.tryExamples || 'Try example')}
        </button>
      </div>

      {/* Refined Drag-and-Drop Area */}
      {mode === 'uploads' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && !isLocked && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isUploading && !isLocked) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={labels.uploadButton || 'Upload Document'}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isDragging
              ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
              : 'border-border/80 bg-surface/30 hover:border-accent/80 hover:bg-surface/60'
          } ${isUploading || isLocked ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.docx"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading || isLocked || Boolean(deletingId)}
            aria-hidden="true"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2 text-accent">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
              <p className="text-xs font-medium text-text">
                {labels.uploading || 'Processing & embedding document...'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:bg-accent/20">
                <UploadCloud className="h-4.5 w-4.5" />
              </div>
              <p className="text-xs font-medium text-text">
                {labels.uploadButton || 'Upload Document'}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {labels.dragDropHint || 'Drag & drop or browse'} • PDF, TXT, MD, DOCX
              </p>
            </>
          )}
        </div>
      )}

      {/* Documents List */}
      <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-0.5">
        {documents.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-surface/20 px-4 py-8 text-center text-xs text-muted">
            <FileText className="mx-auto mb-2 h-6 w-6 text-muted/50" />
            <p>{labels.noDocs || 'No documents in knowledge base'}</p>
            <p className="mt-1 text-[10px] text-muted/80">
              {mode === 'uploads'
                ? 'Drop a document above to begin querying'
                : 'Click "Try example" to load sample datasets'}
            </p>
          </div>
        ) : (
          documents.map((doc, index) => {
            const example = examples.find((item) => item.id === doc.id);
            const isDeleting = deletingId === doc.id;
            const badge = getFileTypeBadge(doc.filename, doc.file_type);

            return (
              <div
                key={doc.id}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-surface/30 px-3 py-2 transition-all duration-150 hover:border-border hover:bg-surface/60"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span
                    className={`inline-flex shrink-0 items-center justify-center rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold ${badge.badgeClass}`}
                  >
                    {badge.label}
                  </span>
                  <div className="min-w-0 flex-1 truncate">
                    <p
                      className="truncate text-xs font-medium text-text"
                      title={example?.title || doc.filename}
                    >
                      {example?.title || doc.filename}
                    </p>
                    <p className="font-mono text-[10px] text-muted">
                      {doc.chunks_count} chunks • {(doc.file_size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {doc.source === 'example' ? (
                    <button
                      type="button"
                      onClick={() => void handleDownload(doc.filename)}
                      aria-label={`${labels.downloadExample || 'Download example'}: ${example?.title || doc.filename}`}
                      className="icon-button"
                      title={labels.downloadExample || 'Download example'}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    onDeleteDoc && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(doc.id);
                        }}
                        disabled={Boolean(deletingId)}
                        className="icon-button danger"
                        title={labels.deleteDocument || 'Delete document'}
                        aria-label={`${labels.deleteDocument || 'Delete document'}: ${doc.filename}`}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )
                  )}

                  {doc.source === 'upload' && (
                    <CheckCircle2
                      className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400"
                      aria-label="Document indexed"
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clear All Documents Button */}
      {mode === 'uploads' && documents.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          disabled={Boolean(deletingId) || isUploading || isLocked}
          className="pill-button danger justify-center w-full py-2 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.clearAll || 'Clear all documents'}
        </button>
      )}

      {/* Subtle Toast / Banner for Errors (Refined & Self-dismissing) */}
      {errorMsg && (
        <div
          role="alert"
          className="animate-fade-in flex items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span className="truncate font-mono text-[11px]">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="rounded p-0.5 hover:bg-rose-500/20 text-rose-500"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};