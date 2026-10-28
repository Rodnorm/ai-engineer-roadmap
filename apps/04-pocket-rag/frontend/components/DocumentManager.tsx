'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  X,
  Loader2,
  Folder,
  Terminal,
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

function getFileTypeTag(filename: string, fileType: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || fileType.toLowerCase();
  switch (ext) {
    case 'pdf':
      return { tag: 'PDF', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' };
    case 'md':
    case 'markdown':
      return { tag: 'MD', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' };
    case 'docx':
    case 'doc':
      return { tag: 'DOC', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' };
    default:
      return { tag: 'TXT', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' };
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

  // Auto-dismiss error after 6s
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
    if (!window.confirm(labels.clearConfirm || 'Purge all documents from vault?')) return;
    setDeletingId('all');
    setErrorMsg(null);
    try {
      await onClearAll();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.operationFailed || 'Purge failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadExamples = async () => {
    setErrorMsg(null);
    try {
      await onLoadExamples();
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      const fallback = labels.operationFailed || 'Failed to load examples';
      setErrorMsg(msg && !msg.startsWith('[') && !msg.startsWith('{') ? msg : fallback);
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
    <div className="terminal-box flex flex-col font-mono text-xs">
      {/* Vault Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-accent" />
          <span className="font-bold text-text uppercase tracking-wider">
            {'// DOCUMENT_VAULT'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <span>[COUNT:</span>
          <span className="font-bold text-accent">{documents.length}</span>
          <span>]</span>
        </div>
      </div>

      {/* Tabs: Code editor / CLI switches style */}
      <div className="flex border-b border-border bg-panel">
        <button
          type="button"
          onClick={() => void onModeChange('uploads')}
          disabled={isLocked || isLoadingExamples}
          className={`flex-1 py-2 px-3 text-[11px] font-mono transition-colors border-r border-border text-center cursor-pointer ${
            mode === 'uploads'
              ? 'bg-surface text-accent border-b-2 border-b-accent font-bold'
              : 'text-muted hover:text-text hover:bg-surface/30'
          }`}
        >
          [ 01: MY DOCS ]
        </button>
        <button
          type="button"
          onClick={() => void handleLoadExamples()}
          disabled={isLocked || isLoadingExamples}
          className={`flex-1 py-2 px-3 text-[11px] font-mono transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'examples'
              ? 'bg-surface text-accent border-b-2 border-b-accent font-bold'
              : 'text-muted hover:text-text hover:bg-surface/30'
          }`}
        >
          {isLoadingExamples && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
          <span>{isLoadingExamples ? '[ LOADING... ]' : '[ 02: EXAMPLES ]'}</span>
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Dropzone with ASCII Terminal Box aesthetic */}
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
            className={`group relative flex cursor-pointer flex-col items-center justify-center border border-dashed p-4 text-center transition-colors focus:outline-none focus:ring-1 focus:ring-accent ${
              isDragging
                ? 'border-accent bg-accent/10'
                : 'border-border bg-bg hover:border-border-focus hover:bg-surface/40'
            } ${isUploading || isLocked ? 'opacity-50 pointer-events-none' : ''}`}
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
              <div className="flex flex-col items-center gap-1 py-1 text-accent">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-[11px] font-bold tracking-wider">
                  [INDEXING EMBEDDINGS...]
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-terminal group-hover:text-accent mb-1">
                  <Upload className="h-4 w-4" />
                  <span className="font-bold text-[11px] tracking-wide">
                    [ ↑ ] DRAG & DROP SOURCE FILES HERE
                  </span>
                </div>
                <div className="text-[10px] text-muted">
                  FORMATS: .PDF, .TXT, .MD, .DOCX &lt; 10MB
                </div>
              </>
            )}
          </div>
        )}

        {/* File Explorer Table */}
        <div className="space-y-1 max-h-[380px] overflow-y-auto pr-0.5">
          {documents.length === 0 ? (
            <div className="border border-border/60 bg-bg/40 p-4 text-center font-mono text-[11px] text-muted">
              <p>[!] Vault is currently empty.</p>
              <p className="mt-1 text-[10px] text-muted/70">
                {mode === 'uploads'
                  ? 'Drop source files above to mount to SQLite vector index.'
                  : 'Click [ 02: EXAMPLES ] to load demonstration contracts.'}
              </p>
            </div>
          ) : (
            documents.map((doc) => {
              const example = examples.find((item) => item.id === doc.id);
              const isDeleting = deletingId === doc.id;
              const typeInfo = getFileTypeTag(doc.filename, doc.file_type);

              return (
                <div
                  key={doc.id}
                  className="group flex items-center justify-between border border-border bg-bg/60 px-2.5 py-1.5 transition-colors hover:border-border-focus hover:bg-surface/50 font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <span
                      className={`inline-block px-1 py-0.2 text-[9px] font-bold border ${typeInfo.color}`}
                    >
                      {typeInfo.tag}
                    </span>
                    <div className="truncate min-w-0 flex-1">
                      <p
                        className="truncate text-[11px] text-text font-medium"
                        title={example?.title || doc.filename}
                      >
                        {example?.title || doc.filename}
                      </p>
                      <p className="text-[10px] text-muted">
                        {(doc.file_size_bytes / 1024).toFixed(1)}KB • {doc.chunks_count} chunks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="hidden sm:inline-block text-[9px] text-accent bg-accent/10 border border-accent/30 px-1 py-0.2">
                      [READY]
                    </span>

                    {doc.source === 'example' ? (
                      <button
                        type="button"
                        onClick={() => void handleDownload(doc.filename)}
                        aria-label={`${labels.downloadExample || 'Download'}: ${example?.title || doc.filename}`}
                        className="icon-button text-muted hover:text-accent"
                        title={labels.downloadExample || 'Download'}
                      >
                        <Download className="h-3 w-3" />
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
                          title={labels.deleteDocument || 'Delete'}
                          aria-label={`${labels.deleteDocument || 'Delete'}: ${doc.filename}`}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Purge All Documents Button */}
        {mode === 'uploads' && documents.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={Boolean(deletingId) || isUploading || isLocked}
            className="w-full border border-error/40 bg-error/10 py-1.5 text-[11px] font-mono text-error hover:bg-error/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="h-3 w-3" />
            <span>[ ! PURGE VAULT DOCUMENTS ]</span>
          </button>
        )}

        {/* Technical Error Toast */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-center justify-between border border-error bg-error/10 px-2.5 py-1.5 text-[11px] font-mono text-error"
          >
            <span className="truncate">[ERR: {errorMsg}]</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="ml-2 hover:opacity-75 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};