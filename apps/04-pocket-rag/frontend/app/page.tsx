'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { DocumentManager } from '../components/DocumentManager';
import { ChatInterface, ChatMessage } from '../components/ChatInterface';
import { CitationsDrawer } from '../components/CitationsDrawer';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  fetchDocuments,
  fetchExampleDocuments,
  loadExampleDocuments,
  uploadDocument,
  clearAllDocuments,
  queryRAG,
  fetchStats,
  DocumentItem,
  Citation,
  SystemStats,
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

  const loadData = useCallback(async (scope: DocumentMode) => {
    try {
      const [docs, st] = await Promise.all([
        fetchDocuments(scope),
        fetchStats(),
      ]);
      setDocuments(docs);
      setStats(st);
    } catch (e) {
      console.warn('Backend connection pending or offline:', e);
    }
  }, []);

  useEffect(() => {
    loadData('uploads');
    fetchExampleDocuments().then(setExamples).catch((e) => {
      console.warn('Example documents unavailable:', e);
    });
  }, [loadData]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadDocument(file);
      await loadData('uploads');
    } finally {
      setIsUploading(false);
    }
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
      await loadData('examples');
      setExamples(await fetchExampleDocuments());
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

    try {
      const res = await queryRAG(question, 4, 0.3, locale, documentMode);

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
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `Error connecting to pocketRag API: ${err.message || 'Server error'}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      <Header
        monthlySavings={stats?.monthly_cloud_savings_usd || 75.0}
      />

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
              onSelectCitation={(cit) => setSelectedCitation(cit)}
              suggestedQuestions={documentMode === 'examples' ? [
                labels.exampleQuestion1,
                labels.exampleQuestion2,
                labels.exampleQuestion3,
                labels.exampleQuestion4,
                labels.exampleQuestion5,
              ].filter(Boolean) : []}
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
