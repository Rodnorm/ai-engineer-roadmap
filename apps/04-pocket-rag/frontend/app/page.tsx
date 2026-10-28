'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { DocumentManager } from '../components/DocumentManager';
import { ChatInterface, ChatMessage } from '../components/ChatInterface';
import { CitationsDrawer } from '../components/CitationsDrawer';
import { TelemetryBar } from '../components/TelemetryBar';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  fetchDocuments,
  fetchExampleDocuments,
  loadExampleDocuments,
  uploadDocument,
  deleteDocument,
  clearAllDocuments,
  queryRAG,
  fetchStats,
  fetchSuggestedQuestions,
  DocumentItem,
  Citation,
  SystemStats,
  ApiError,
  ExampleDocument,
} from '../lib/api';

type DocumentMode = 'uploads' | 'examples';

export default function Home() {
  const { locale, dict } = useI18n();
  const labels = dict.labels;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [examples, setExamples] = useState<ExampleDocument[]>([]);
  const [documentMode, setDocumentMode] = useState<DocumentMode>('uploads');
  const [isLoadingExamples, setIsLoadingExamples] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [lastCost, setLastCost] = useState(0);
  const [lastTokens, setLastTokens] = useState(0);
  const [lastLatency, setLastLatency] = useState(0);
  const queryController = useRef<AbortController | null>(null);
  const suggestionController = useRef<AbortController | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const uploadDocumentSignature = documentMode === 'uploads'
    ? documents.map((document) => document.id).join('|')
    : '';

  const loadData = useCallback(async (scope: DocumentMode = 'uploads') => {
    try {
      const [docs, currentStats] = await Promise.all([fetchDocuments(scope), fetchStats()]);
      setDocuments(docs);
      setStats(currentStats);
    } catch (e) {
      console.warn('Backend connection pending or offline:', e);
    }
  }, []);

  useEffect(() => {
    void loadData('uploads');
    void fetchExampleDocuments().then(setExamples).catch((error) => {
      console.warn('Example documents are unavailable:', error);
    });
    return () => queryController.current?.abort();
  }, [loadData]);

  useEffect(() => {
    suggestionController.current?.abort();
    if (!uploadDocumentSignature) {
      setSuggestedQuestions([]);
      return;
    }

    const controller = new AbortController();
    suggestionController.current = controller;
    setSuggestedQuestions([]);
    void fetchSuggestedQuestions(locale, controller.signal)
      .then((response) => setSuggestedQuestions(response.questions))
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.warn('Question suggestions are unavailable:', error);
      })
      .finally(() => {
        if (suggestionController.current === controller) {
          suggestionController.current = null;
        }
      });

    return () => controller.abort();
  }, [locale, uploadDocumentSignature]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadDocument(file);
      await loadData('uploads');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    await deleteDocument(docId);
    await loadData('uploads');
  };

  const handleClearAll = async () => {
    await clearAllDocuments();
    await loadData('uploads');
    setMessages([]);
  };

  const handleModeChange = async (mode: DocumentMode) => {
    setDocumentMode(mode);
    setMessages([]);
    await loadData(mode);
  };

  const handleLoadExamples = async () => {
    setIsLoadingExamples(true);
    try {
      await loadExampleDocuments();
      setDocumentMode('examples');
      setMessages([]);
      const [docs, availableExamples] = await Promise.all([
        fetchDocuments('examples'),
        fetchExampleDocuments(),
      ]);
      setDocuments(docs);
      setExamples(availableExamples);
    } finally {
      setIsLoadingExamples(false);
    }
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
      const res = await queryRAG(question, 4, 0.3, locale, documentMode, controller.signal);

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
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-mono">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 p-3 sm:p-5">
        {/* Main DevTool Workspace: Document Vault & Query Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          <div className="lg:col-span-4">
            <DocumentManager
              documents={documents}
              isUploading={isUploading}
              isLocked={isQuerying}
              onUpload={handleUpload}
              onDeleteDoc={handleDeleteDoc}
              onClearAll={handleClearAll}
              mode={documentMode}
              examples={examples}
              isLoadingExamples={isLoadingExamples}
              onModeChange={handleModeChange}
              onLoadExamples={handleLoadExamples}
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
              onClearChat={() => setMessages([])}
              suggestedQuestions={documentMode === 'examples' ? [
                labels.exampleQuestion1,
                labels.exampleQuestion2,
                labels.exampleQuestion3,
                labels.exampleQuestion4,
                labels.exampleQuestion5,
              ] : suggestedQuestions}
              emptyStateSuggestions={documentMode === 'examples' ? [
                'What are the main obligations in this contract?',
                'List all renewal and termination clauses',
                'Extract and summarize all deadlines and action items',
              ] : suggestedQuestions.slice(0, 3)}
              labels={labels}
            />
          </div>
        </div>
      </main>

      {/* Terminal Statusline docked at bottom */}
      <TelemetryBar
        stats={stats}
        lastCost={lastCost}
        lastTokens={lastTokens}
        lastLatency={lastLatency}
        labels={labels}
        isBusy={isQuerying || isUploading}
      />

      <CitationsDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
        labels={labels}
      />
    </div>
  );
}
