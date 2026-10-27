'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Sparkles,
  Square,
  User,
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
  const [isMac, setIsMac] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionsButtonRef = useRef<HTMLButtonElement>(null);
  const suggestionsPanelId = useId();

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform));
  }, []);

  // Scroll to bottom when new messages arrive
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

    // Support commands like /clear
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
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
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
          className="inline-flex items-center mx-0.5 rounded px-1.5 py-0.2 font-mono text-[11px] font-semibold text-accent bg-accent/10 border border-accent/25 hover:bg-accent/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-colors cursor-pointer"
          aria-label={`${labels.openCitation || 'Open citation'} ${citation.citation_id}: ${citation.filename}`}
        >
          {part}
        </button>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      );
    });
  };

  // Curated starter prompts when emptyStateSuggestions is empty or minimal
  const defaultStarters = [
    'Resuma as seções principais deste documento',
    'Liste os pontos de ação e prazos citados',
    'Quais são os principais riscos, custos e obrigações?',
  ];
  const starters = emptyStateSuggestions.length > 0 ? emptyStateSuggestions.slice(0, 3) : defaultStarters;

  return (
    <div className="flex flex-col h-[640px] rounded-2xl border border-border/70 bg-panel/80 backdrop-blur-sm shadow-xs overflow-hidden">
      {/* Top Header inside Chat */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text">
              {labels.assistantTitle || 'pocketRag Assistant'}
            </h3>
            <p className="text-[10px] text-muted">
              Semantic Search & Direct Citations
            </p>
          </div>
        </div>

        {messages.length > 0 && onClearChat && (
          <button
            type="button"
            onClick={onClearChat}
            className="pill-button text-[10px] py-1 px-2.5 cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-center px-4 py-8 max-w-xl mx-auto">
            {/* Empty State Banner */}
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold tracking-tight text-text">
                {labels.assistantTitle || 'pocketRag Assistant'}
              </h3>
              <p className="mt-1 text-xs text-muted">
                Ask questions and retrieve answers grounded in your indexed documents.
              </p>
            </div>

            {/* Clickable Starter Prompt Cards */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                Suggested prompts
              </p>
              <div className="grid grid-cols-1 gap-2">
                {starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => void onSend(starter)}
                    disabled={isLoading}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface/30 px-3.5 py-3 text-left transition-all duration-150 hover:border-accent/60 hover:bg-surface/70 hover:shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <span className="text-xs text-text group-hover:text-accent transition-colors leading-relaxed">
                      {starter}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-accent-strong text-white rounded-br-xs font-normal'
                      : 'bg-surface/50 border border-border/70 text-text rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {msg.sender === 'assistant' ? renderAnswer(msg) : msg.text}
                  </p>
                </div>

                {/* Citations Badges */}
                {msg.sender === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-1">
                    <span className="text-[10px] font-semibold text-muted flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-accent" aria-hidden="true" />
                      {labels.citationsLabel || 'Citations'}:
                    </span>
                    {msg.citations.map((c) => (
                      <button
                        key={c.citation_id}
                        onClick={() => onSelectCitation(c)}
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-medium text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                      >
                        [{c.citation_id}] {c.filename}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface text-muted mt-0.5">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2.5 text-xs text-accent animate-fade-in pl-1"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </div>
            <span className="font-medium">{labels.thinking || 'Retrieving context & generating answer...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Area */}
      <div className="border-t border-border/60 bg-panel/60 p-3 backdrop-blur-md">
        {/* Suggested Questions Dropdown (if available) */}
        {suggestedQuestions.length > 0 && (
          <div ref={suggestionsRef} className="relative mb-2">
            <button
              ref={suggestionsButtonRef}
              type="button"
              onClick={() => setIsSuggestionsOpen((open) => !open)}
              disabled={isLoading}
              aria-expanded={isSuggestionsOpen}
              aria-controls={suggestionsPanelId}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface/40 px-2.5 py-1 text-[11px] font-medium text-muted transition-colors hover:border-accent/40 hover:bg-surface hover:text-text disabled:opacity-50 cursor-pointer"
            >
              <Search className="h-3 w-3" />
              {labels.suggestedQuestions || 'Suggested questions'}
              {isSuggestionsOpen ? (
                <ChevronUp className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              )}
            </button>

            {isSuggestionsOpen && (
              <div
                id={suggestionsPanelId}
                role="region"
                aria-label={labels.suggestedQuestions || 'Suggested questions'}
                className="animate-fade-in absolute bottom-full left-0 z-30 mb-2 max-h-56 w-full overflow-y-auto rounded-xl border border-border/70 bg-panel/95 p-1.5 shadow-xl backdrop-blur-md"
              >
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => {
                      setIsSuggestionsOpen(false);
                      void onSend(question);
                    }}
                    disabled={isLoading}
                    className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-xs text-text transition-colors hover:bg-surface focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50 cursor-pointer"
                  >
                    <span className="min-w-0 flex-1">{question}</span>
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Form with Command Support & Shortcut Pill */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center rounded-2xl border border-border/70 bg-surface/30 p-1.5 transition-all duration-150 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/50 focus-within:bg-panel"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.queryPlaceholder || 'Ask a question or type /clear to reset...'}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-text placeholder:text-muted focus:outline-none"
            disabled={isLoading}
            aria-label={labels.queryLabel || 'Question'}
            maxLength={2000}
          />

          <div className="flex items-center gap-1.5 pr-1">
            {isLoading ? (
              <button
                type="button"
                onClick={onCancel}
                aria-label={labels.cancel || 'Cancel'}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                title="Cancel response"
              >
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label={labels.send || 'Send question'}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-accent px-3 text-xs font-medium text-white transition-all hover:bg-accent-strong disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <kbd className="hidden sm:inline font-mono text-[10px] opacity-75">
                  {isMac ? '⌘↵' : 'Ctrl↵'}
                </kbd>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
