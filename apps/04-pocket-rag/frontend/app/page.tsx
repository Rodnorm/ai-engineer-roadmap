'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { DocumentManager } from '../components/DocumentManager';
import { ChatInterface, ChatMessage } from '../components/ChatInterface';
import { CitationsDrawer } from '../components/CitationsDrawer';
import { TelemetryPanel } from '../components/TelemetryPanel';
import {
  fetchDocuments,
  uploadDocument,
  clearAllDocuments,
  queryRAG,
  fetchStats,
  DocumentItem,
  Citation,
  SystemStats,
} from '../lib/api';
import translations from '../data/translations.json';

export default function Home() {
  const [lang, setLang] = useState<'en' | 'pt-BR' | 'de'>('en');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [lastCost, setLastCost] = useState(0);
  const [lastTokens, setLastTokens] = useState(0);
  const [lastLatency, setLastLatency] = useState(0);

  const t = translations[lang] || translations.en;

  const loadData = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      const st = await fetchStats();
      setStats(st);
    } catch (e) {
      console.warn('Backend connection pending or offline:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadDocument(file);
      await loadData();
    } finally {
      setIsUploading(false);
    }
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

    try {
      const res = await queryRAG(question, 4, 0.3, lang);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        lang={lang}
        onLangChange={(newLang) => setLang(newLang)}
        monthlySavings={stats?.monthly_cloud_savings_usd || 75.0}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 space-y-5">
        {/* Telemetry Header Strip */}
        <TelemetryPanel
          stats={stats}
          lastCost={lastCost}
          lastTokens={lastTokens}
          lastLatency={lastLatency}
          labels={t}
        />

        {/* Main Grid: Left Panel (Doc Manager) & Right Panel (Chat) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4">
            <DocumentManager
              documents={documents}
              isUploading={isUploading}
              onUpload={handleUpload}
              onClearAll={handleClearAll}
              labels={t}
            />
          </div>

          <div className="lg:col-span-8">
            <ChatInterface
              messages={messages}
              isLoading={isQuerying}
              onSend={handleSendQuestion}
              onSelectCitation={(cit) => setSelectedCitation(cit)}
              labels={t}
            />
          </div>
        </div>
      </main>

      <CitationsDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
}
