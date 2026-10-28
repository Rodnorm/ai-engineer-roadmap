'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Terminal,
  Trash2,
  Search,
} from 'lucide-react';
import { Citation, DocumentChunk } from '../lib/api';

const CITATION_SPLIT = /(\[\d+\])/g;
const CITATION_ONLY = /^\[(\d+)]$/;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  chunks?: DocumentChunk[];
  latency_ms?: number;
  tokens?: number;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (question: string) => Promise<void>;
  onCancel: () => void;
  onSelectCitation: (citation: Citation) => void;
  onClearChat?: () => void;
  labels: Record<string, string>;
  suggestedQuestions?: string[];
  emptyStateSuggestions?: string[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSend,
  onCancel,
  onSelectCitation,
  onClearChat,
  labels,
  suggestedQuestions = [],
  emptyStateSuggestions = [],
}) => {
  const [input, setInput] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionsButtonRef = useRef<HTMLButtonElement>(null);
  const suggestionsPanelId = useId();

  // Auto-scroll to bottom on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isSuggestionsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!suggestionsRef.current?.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSuggestionsOpen(false);
        suggestionsButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSuggestionsOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (trimmed.toLowerCase() === '/clear') {
      setInput('');
      onClearChat?.();
      return;
    }

    const q = trimmed;
    setInput('');
    await onSend(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const renderAnswer = (message: ChatMessage) => {
    const citations = new Map(message.citations?.map((citation) => [citation.citation_id, citation]));
    return message.text.split(CITATION_SPLIT).map((part, index) => {
      const match = CITATION_ONLY.exec(part);
      const citation = match ? citations.get(Number(match[1])) : undefined;
      return citation ? (
        <button
          type="button"
          key={`${part}-${index}`}
          onClick={() => onSelectCitation(citation)}
          className="inline-flex items-center mx-1 px-1.5 py-0.2 font-mono text-[10px] font-bold text-accent bg-accent/10 border border-accent/40 hover:bg-accent/20 cursor-pointer"
          title={`${citation.filename} (Chunk ${citation.chunk_index + 1})`}
          aria-label={`${labels.openCitation || 'Citation'} ${citation.citation_id}: ${citation.filename}`}
        >
          [ref:{citation.filename.slice(0, 16)}#{citation.chunk_index + 1}]
        </button>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      );
    });
  };

  const defaultStarters = [
    'Resuma as seções principais deste documento',
    'Liste os pontos de ação e prazos citados',
    'Diagnóstico de inconsistências e riscos contratuais',
  ];
  const starters = emptyStateSuggestions.length > 0 ? emptyStateSuggestions.slice(0, 3) : defaultStarters;

  return (
    <div className="terminal-box flex flex-col h-[650px] font-mono text-xs">
      {/* Console Top Bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-accent" />
          <span className="font-bold text-text uppercase tracking-wider">
            {'// QUERY_CONSOLE'}
          </span>
          <span className="text-muted text-[11px] hidden sm:inline">
            :: ACTIVE_SESSION
          </span>
        </div>

        <div className="flex items-center gap-2">
          {suggestedQuestions.length > 0 && (
            <div ref={suggestionsRef} className="relative">
              <button
                ref={suggestionsButtonRef}
                type="button"
                onClick={() => setIsSuggestionsOpen((open) => !open)}
                disabled={isLoading}
                aria-expanded={isSuggestionsOpen}
                aria-controls={suggestionsPanelId}
                className="inline-flex items-center gap-1 border border-border bg-panel px-2 py-0.5 text-[10px] text-terminal hover:border-border-focus hover:text-text cursor-pointer"
              >
                <Search className="h-2.5 w-2.5" />
                <span>[:queries]</span>
                {isSuggestionsOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>

              {isSuggestionsOpen && (
                <div
                  id={suggestionsPanelId}
                  role="region"
                  className="absolute right-0 top-full z-40 mt-1 max-h-56 w-80 overflow-y-auto border border-border bg-panel p-1 shadow-lg"
                >
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setIsSuggestionsOpen(false);
                        void onSend(q);
                      }}
                      className="flex w-full items-start gap-1.5 p-1.5 text-left text-[11px] text-terminal hover:bg-surface hover:text-accent cursor-pointer"
                    >
                      <span className="text-accent">&gt;</span>
                      <span className="min-w-0 flex-1">{q}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.length > 0 && onClearChat && (
            <button
              type="button"
              onClick={onClearChat}
              className="inline-flex items-center gap-1 border border-border bg-panel px-2 py-0.5 text-[10px] text-muted hover:border-error/40 hover:text-error transition-colors cursor-pointer"
              title="Clear console output"
            >
              <Trash2 className="h-2.5 w-2.5" />
              <span>[:clear]</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages / Execution Output Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg/50">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-center max-w-xl mx-auto py-6">
            {/* Terminal Welcome Banner */}
            <div className="mb-5 space-y-2">
              <div className="border border-accent bg-accent/5 p-3 font-mono">
                <div className="text-accent font-bold text-xs tracking-tight">
                  POCKET_RAG :: VECTOR QUERY CONSOLE [LOCAL_ENGINE v0.4]
                </div>
                <div className="text-muted text-[11px] mt-1">
                  SQLite Vector DB: MOUNTED | OpenAI Embeddings: 1536-dim
                </div>
              </div>
              <p className="text-muted text-[11px] px-0.5">
                Type query in terminal prompt below or select quick execution commands:
              </p>
            </div>

            {/* Quick Starters Styled as Terminal Command Executions */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
                {'// QUICK_STARTERS'}
              </div>
              {starters.map((starter, i) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => void onSend(starter)}
                  disabled={isLoading}
                  className="group flex w-full items-center justify-between border border-border bg-panel px-3 py-2 text-left font-mono text-xs transition-colors hover:border-accent hover:bg-surface cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold">[ 0{i + 1} ]</span>
                    <span className="text-text group-hover:text-accent transition-colors">
                      {starter}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted group-hover:text-accent font-bold">
                    <span>[ ↵ EXEC ]</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-1 font-mono text-xs">
              {/* Message Header Prompt Indicator */}
              <div className="flex items-center gap-2 text-[10px] text-muted">
                {msg.sender === 'user' ? (
                  <span className="text-accent font-bold">
                    guest@pocket-rag:~$
                  </span>
                ) : (
                  <span className="text-orange-400 font-bold">
                    rag@engine:~# [OUTPUT]
                  </span>
                )}
                {msg.latency_ms !== undefined && (
                  <span>
                    ({msg.latency_ms}ms • {msg.tokens || 0} tokens)
                  </span>
                )}
              </div>

              {/* Message Body */}
              <div
                className={`border p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'border-border bg-surface text-text'
                    : 'border-border-focus bg-panel text-text'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.sender === 'assistant' ? renderAnswer(msg) : msg.text}
                </div>

                {/* Citations Badges */}
                {msg.sender === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border/60 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-muted flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-accent" />
                      SOURCES:
                    </span>
                    {msg.citations.map((c) => (
                      <button
                        key={c.citation_id}
                        type="button"
                        onClick={() => onSelectCitation(c)}
                        className="border border-accent/40 bg-accent/10 px-1.5 py-0.2 font-mono text-[10px] text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                      >
                        [ref:{c.filename}#chunk{c.chunk_index + 1}]
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Querying Indicator */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-accent font-mono text-xs border border-accent/40 bg-accent/10 p-2.5"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>[QUERYING] Searching vector embeddings &amp; synthesizing context...</span>
            <span className="animate-blink font-bold">_</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Terminal Shell Input Bar */}
      <div className="border-t border-border bg-panel p-2.5">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Shell prompt prefix */}
          <span className="font-mono text-xs font-bold text-accent shrink-0 pl-1">
            guest@pocket-rag:~$
          </span>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.queryPlaceholder || 'Ask a question or type /clear...'}
            className="flex-1 bg-bg border border-border px-3 py-1.5 font-mono text-xs text-text placeholder:text-muted focus:border-accent focus:outline-none"
            disabled={isLoading}
            aria-label={labels.queryLabel || 'Question'}
            maxLength={2000}
          />

          {isLoading ? (
            <button
              type="button"
              onClick={onCancel}
              className="border border-error/50 bg-error/15 px-3 py-1.5 font-mono text-xs text-error hover:bg-error/25 cursor-pointer shrink-0"
              title="Abort execution"
            >
              [ ■ ABORT ]
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label={labels.send || 'Execute'}
              className="terminal-btn-accent shrink-0 cursor-pointer disabled:opacity-40"
            >
              <span>[ ↵ EXEC ]</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
