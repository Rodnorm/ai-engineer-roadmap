"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { InvocationTelemetry } from "@/types/deployment";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Layers,
  Terminal,
  Zap,
} from "lucide-react";

interface DeploymentTraceVisualizerProps {
  telemetry: InvocationTelemetry[];
}

export function DeploymentTraceVisualizer({ telemetry }: DeploymentTraceVisualizerProps) {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t.trace.title}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {t.trace.subtitle}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-[var(--text-muted)]">
          {telemetry.length} eventos registrados
        </span>
      </div>

      {/* Empty State */}
      {telemetry.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
          <Layers className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <p className="text-xs text-[var(--text-muted)]">{t.trace.emptyTrace}</p>
        </div>
      ) : (
        /* Telemetry Trace List */
        <div className="space-y-2">
          {telemetry.map((item) => {
            const isExpanded = expandedId === item.id;
            const isBlue = item.target === "blue";
            const isSuccess = item.success && item.statusCode < 400;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden transition-all"
              >
                {/* Summary Row */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--bg-surface)] transition-colors text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button className="text-[var(--text-muted)]">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Target Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isBlue
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {item.target.toUpperCase()}
                    </span>

                    {/* Model */}
                    <span className="font-semibold text-[var(--text-primary)] truncate">
                      {item.model}
                    </span>

                    {/* Chaos Injected Badge */}
                    {item.isChaosInjected && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        CHAOS: {item.chaosType}
                      </span>
                    )}

                    {/* Shadow Badge */}
                    {item.shadowResult && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        SHADOW MIRROR
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Latency */}
                    <span className="flex items-center gap-1 text-[var(--text-muted)]">
                      <Clock className="w-3 h-3 text-blue-400" />
                      {item.latencyMs}ms
                    </span>

                    {/* TTFT */}
                    <span className="hidden sm:flex items-center gap-1 text-[var(--text-muted)]">
                      <Zap className="w-3 h-3 text-amber-400" />
                      {item.ttftMs}ms
                    </span>

                    {/* Cost */}
                    <span className="hidden sm:inline text-emerald-400">
                      ${item.estimatedCostUsd}
                    </span>

                    {/* Status Code Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSuccess
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      HTTP {item.statusCode}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 text-xs">
                    <div>
                      <p className="text-[11px] font-bold text-[var(--text-muted)] mb-1">PROMPT:</p>
                      <pre className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-[11px] whitespace-pre-wrap text-[var(--text-primary)]">
                        {item.prompt}
                      </pre>
                    </div>

                    {item.error ? (
                      <div>
                        <p className="text-[11px] font-bold text-rose-400 mb-1">ERRO REGISTRADO:</p>
                        <pre className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 font-mono text-[11px] whitespace-pre-wrap text-rose-300">
                          {item.error}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] font-bold text-[var(--text-muted)]">RESPOSTA DO MODELO:</p>
                          <button
                            onClick={() => handleCopy(item.id, item.response)}
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>{t.common.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{t.common.copy}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-[11px] whitespace-pre-wrap text-[var(--text-primary)] max-h-48 overflow-y-auto">
                          {item.response}
                        </pre>
                      </div>
                    )}

                    {/* Shadow result comparison if present */}
                    {item.shadowResult && (
                      <div>
                        <p className="text-[11px] font-bold text-purple-400 mb-1">
                          {t.trace.shadowResult} ({item.shadowResult.model} • {item.shadowResult.latencyMs}ms)
                        </p>
                        <pre className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20 font-mono text-[11px] whitespace-pre-wrap text-purple-200">
                          {item.shadowResult.response}
                        </pre>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                      <span>Tokens Prompt: {item.promptTokens}</span>
                      <span>Tokens Resposta: {item.completionTokens}</span>
                      <span>Total: {item.totalTokens}</span>
                      <span>Timestamp: {new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
