'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { Citation, DocumentChunk } from '../lib/api';

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
  onSelectCitation: (citation: Citation) => void;
  labels: Record<string, string>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSend,
  onSelectCitation,
  labels,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const q = input;
    setInput('');
    await onSend(q);
  };

  return (
    <div className="flex flex-col h-[620px] rounded-2xl border border-border bg-panel backdrop-blur-sm shadow-sm overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 dark:text-sky-400 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-text">
              pocketRag Assistant
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Upload PDF or text documents on the left panel, then ask any question to retrieve grounded answers with vector citations!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/30">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`flex flex-col max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-surface/50 border border-border text-text rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Citations Badges */}
                {msg.sender === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-muted flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-sky-500 dark:text-sky-400" /> Citations:
                    </span>
                    {msg.citations.map((c) => (
                      <button
                        key={c.citation_id}
                        onClick={() => onSelectCitation(c)}
                        className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-300 hover:bg-sky-500/20 transition cursor-pointer"
                      >
                        [{c.citation_id}] {c.filename}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-muted">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-xs text-sky-500 dark:text-sky-400 animate-pulse">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/30">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <span>{labels.thinking || 'Retrieving context & generating answer...'}</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-border p-3 bg-surface/20 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={labels.queryPlaceholder || 'Ask a question about your documents...'}
          className="flex-1 rounded-xl border border-border bg-panel px-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white hover:bg-sky-400 disabled:opacity-40 transition shadow-md shadow-sky-500/20 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
