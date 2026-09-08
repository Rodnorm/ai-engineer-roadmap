'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { DocumentManager } from '../components/DocumentManager';
import { ChatInterface, ChatMessage } from '../components/ChatInterface';
import { CitationsDrawer } from '../components/CitationsDrawer';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  clearAllDocuments,
  queryRAG,
  fetchStats,
  DocumentItem,
  Citation,
  SystemStats,
  ApiError,
  setAccessToken,
} from '../lib/api';

export default function Home() {
  const { locale, dict } = useI18n();
  const labels = dict.labels;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [lastCost, setLastCost] = useState(0);
  const [lastTokens, setLastTokens] = useState(0);
  const [lastLatency, setLastLatency] = useState(0);
  const queryController = useRef<AbortController | null>(null);
  const [needsAccess, setNeedsAccess] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [accessError, setAccessError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [docs, currentStats] = await Promise.all([fetchDocuments(), fetchStats()]);
      setDocuments(docs);
      setStats(currentStats);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setNeedsAccess(true);
      console.warn('Backend connection pending or offline:', e);
    }
  };

  useEffect(() => {
    loadData();
    return () => queryController.current?.abort();
  }, [loadData]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadDocument(file);
      await loadData();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    await deleteDocument(docId);
    await loadData();
  };

  const handleClearAll = async () => {
    await clearAllDocuments();
    await loadData();
    setMessages([]);
  };

  const handleSendQuestion = async (question: string) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsQuerying(true);
    const controller = new AbortController();
    queryController.current = controller;

    try {
      const res = await queryRAG(question, 4, 0.3, locale, controller.signal);

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: res.answer,
        citations: res.citations,
        chunks: res.retrieved_chunks,
        latency_ms: res.latency_ms,
        tokens: res.tokens_used.total_tokens,
      };

      setMessages((prev) => [...prev, botMsg]);
      setLastCost(res.estimated_cost_usd);
      setLastTokens(res.tokens_used.total_tokens);
      setLastLatency(res.latency_ms);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      const status = error instanceof ApiError ? error.status : 0;
      const text = status === 429
        ? labels.errorRateLimit
        : status === 413
          ? labels.errorTooLarge
          : status === 422
            ? labels.errorInvalid
            : status === 502 || status === 503
              ? labels.errorUnavailable
              : labels.errorOffline;
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      if (queryController.current === controller) {
        queryController.current = null;
        setIsQuerying(false);
      }
    }
  }, []);

  const handleUnlock = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccessToken(accessKey.trim());
    setAccessError('');
    try {
      const [docs, currentStats] = await Promise.all([fetchDocuments(), fetchStats()]);
      setDocuments(docs);
      setStats(currentStats);
      setNeedsAccess(false);
      setAccessKey('');
    } catch {
      setAccessError(labels.invalidAccess);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      <Header />

      {needsAccess && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form onSubmit={handleUnlock} className="w-full max-w-sm rounded-2xl border border-border bg-panel p-6 shadow-2xl" aria-labelledby="access-title">
            <h2 id="access-title" className="text-lg font-semibold">{labels.accessTitle}</h2>
            <p className="mt-2 text-sm text-muted">{labels.accessDescription}</p>
            <label className="mt-4 block text-xs font-medium" htmlFor="access-key">{labels.accessKey}</label>
            <input id="access-key" type="password" autoComplete="current-password" required value={accessKey} onChange={(event) => setAccessKey(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
            {accessError && <p role="alert" className="mt-2 text-xs text-red-500">{accessError}</p>}
            <button type="submit" className="mt-4 w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white">{labels.unlock}</button>
          </form>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 space-y-5">
        <TelemetryPanel
          stats={stats}
          lastCost={lastCost}
          lastTokens={lastTokens}
          lastLatency={lastLatency}
          labels={labels}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4">
            <DocumentManager
              documents={documents}
              isUploading={isUploading}
              onUpload={handleUpload}
              onDeleteDoc={handleDeleteDoc}
              onClearAll={handleClearAll}
              labels={labels}
            />
          </div>

          <div className="lg:col-span-8">
            <ChatInterface
              messages={messages}
              isLoading={isQuerying}
              onSend={handleSendQuestion}
              onCancel={() => queryController.current?.abort()}
              onSelectCitation={(cit) => setSelectedCitation(cit)}
              labels={labels}
            />
          </div>
        </div>
      </main>

      <CitationsDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
        labels={labels}
      />
    </div>
  );
}
