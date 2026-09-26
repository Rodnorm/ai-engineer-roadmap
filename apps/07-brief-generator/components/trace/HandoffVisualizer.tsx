"use client";

import React, { useState } from "react";
import {
  AgentRole,
  AgentTraceStep,
  PipelineExecutionResult,
} from "@/types/agent";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Feather,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

interface HandoffVisualizerProps {
  steps: AgentTraceStep[];
  isLoading: boolean;
  result?: PipelineExecutionResult | null;
}

export function HandoffVisualizer({
  steps,
  isLoading,
  result,
}: HandoffVisualizerProps) {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const getAgentBadge = (agent: AgentRole) => {
    switch (agent) {
      case "researcher":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-500 border border-sky-500/30">
            <Search className="w-3 h-3" /> Researcher
          </span>
        );
      case "writer":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-500 border border-violet-500/30">
            <Feather className="w-3 h-3" /> Writer
          </span>
        );
      case "orchestrator":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            <Cpu className="w-3 h-3" /> Orchestrator
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-agent-research)]" />
          <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            Handoff & Execution Trace
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          {isLoading && (
            <span className="flex items-center gap-1.5 text-sky-500 animate-pulse font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando...
            </span>
          )}
          {result && (
            <span className="text-emerald-500 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluído ({result.metrics.totalLatencyMs}ms)
            </span>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip (if finished) */}
      {result && (
        <div className="grid grid-cols-3 gap-2 p-2.5 mb-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs">
          <div>
            <span className="text-[var(--text-muted)] block">Pesquisa</span>
            <span className="font-semibold text-sky-400">{result.metrics.researchLatencyMs}ms</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Redação</span>
            <span className="font-semibold text-violet-400">{result.metrics.writerLatencyMs}ms</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Tokens Est.</span>
            <span className="font-semibold text-emerald-400">~{result.metrics.tokensEstimated}</span>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {steps.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-[var(--text-muted)] space-y-2">
            <Bot className="w-8 h-8 opacity-30" />
            <p>Nenhuma execução em andamento.</p>
            <p className="max-w-[240px]">
              Insira um tópico ou escolha um cenário ao lado para disparar a colaboração multi-agente.
            </p>
          </div>
        ) : (
          steps.map((step, idx) => {
            const isHandoff = step.action.includes("Handoff Protocol");
            const isExpanded = expandedStepId === step.id;

            if (isHandoff) {
              return (
                <div
                  key={step.id || idx}
                  className="p-3 my-2 rounded-lg bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-violet-500/10 border border-purple-500/30 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Handoff Protocol: Injeção de Dossier</span>
                    </div>
                    <span className="flex items-center gap-1 text-[var(--text-muted)] text-[11px]">
                      <Clock className="w-3 h-3" /> {step.latencyMs}ms
                    </span>
                  </div>
                  <p className="mt-1 text-[var(--text-muted)] text-[11px]">
                    Dossiê verificado transferido do Researcher para o Writer (Zero-Tool Execution).
                  </p>
                </div>
              );
            }

            return (
              <div
                key={step.id || idx}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs overflow-hidden transition-all hover:border-[var(--card-hover-border)]"
              >
                <div
                  onClick={() => toggleExpand(step.id)}
                  className="flex items-center justify-between p-2.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    {getAgentBadge(step.agent)}
                    <span className="font-medium text-[var(--text-primary)]">
                      {step.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      {step.latencyMs}ms
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-2.5 pt-0 border-t border-[var(--border-subtle)]/60 text-[11px] font-mono space-y-1.5 bg-black/10">
                    {step.input !== undefined && (
                      <div>
                        <span className="text-[var(--text-muted)] font-sans font-semibold block">Entrada:</span>
                        <pre className="p-1.5 rounded bg-black/20 overflow-x-auto text-[var(--text-primary)]">
                          {JSON.stringify(step.input, null, 2)}
                        </pre>
                      </div>
                    )}
                    {step.output !== undefined && (
                      <div>
                        <span className="text-[var(--text-muted)] font-sans font-semibold block">Saída:</span>
                        <pre className="p-1.5 rounded bg-black/20 overflow-x-auto text-[var(--text-primary)]">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
