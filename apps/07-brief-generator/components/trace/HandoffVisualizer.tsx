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
import { useI18n } from "@/lib/i18n/context";
import { localizeStepAction } from "@/lib/i18n/locales";

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
  const { t, locale } = useI18n();
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const getAgentBadge = (agent: AgentRole) => {
    switch (agent) {
      case "researcher":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Search className="w-2.5 h-2.5" /> RES :: {t.handoffVisualizer.agentResearcher}
          </span>
        );
      case "writer":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-semibold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
            <Feather className="w-2.5 h-2.5" /> WRT :: {t.handoffVisualizer.agentWriter}
          </span>
        );
      case "orchestrator":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Cpu className="w-2.5 h-2.5" /> ORC :: {t.handoffVisualizer.agentOrchestrator}
          </span>
        );
    }
  };

  const hasResearcher = steps.some((s) => s.agent === "researcher");
  const hasHandoff = steps.some((s) => s.action.includes("Handoff Protocol"));
  const hasWriter = steps.some((s) => s.agent === "writer");
  const isFinished = Boolean(result);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[var(--dossier-accent)]" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {"//"} {t.handoffVisualizer.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          {isLoading && (
            <span className="flex items-center gap-1.5 text-yellow-500 animate-pulse font-medium text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" /> {t.controlPanel.generatingBtn}
            </span>
          )}
          {result && (
            <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> ({result.metrics.totalLatencyMs}ms)
            </span>
          )}
        </div>
      </div>

      {/* Sequential Pipeline Flow Indicator */}
      <div className="mb-3 p-2.5 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>{"//"} AGENT_TRANSMISSION_PIPELINE</span>
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-yellow-500">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
              STREAMING
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
          <div
            className={`flex-1 py-1 px-1.5 text-center border rounded-xs transition-colors ${
              hasResearcher
                ? "border-sky-500/40 bg-sky-500/10 text-sky-400 font-semibold"
                : "border-[var(--border-subtle)] text-[var(--text-muted)] bg-black/10"
            }`}
          >
            01: RESEARCHER
          </div>
          <ArrowRight className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
          <div
            className={`flex-1 py-1 px-1.5 text-center border rounded-xs transition-colors ${
              hasHandoff
                ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400 font-semibold"
                : "border-[var(--border-subtle)] text-[var(--text-muted)] bg-black/10"
            }`}
          >
            DOSSIER HANDOFF
          </div>
          <ArrowRight className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
          <div
            className={`flex-1 py-1 px-1.5 text-center border rounded-xs transition-colors ${
              hasWriter
                ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400 font-semibold"
                : "border-[var(--border-subtle)] text-[var(--text-muted)] bg-black/10"
            }`}
          >
            02: WRITER
          </div>
          <ArrowRight className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
          <div
            className={`flex-1 py-1 px-1.5 text-center border rounded-xs transition-colors ${
              isFinished
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold"
                : "border-[var(--border-subtle)] text-[var(--text-muted)] bg-black/10"
            }`}
          >
            EXEC BRIEF
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip (if finished) */}
      {result && (
        <div className="grid grid-cols-3 gap-2 p-2.5 mb-3 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] font-mono">
          <div>
            <span className="text-[var(--text-muted)] text-[10px] block uppercase">
              {t.handoffVisualizer.researchLatency}
            </span>
            <span className="font-semibold text-sky-400">{result.metrics.researchLatencyMs}ms</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-[10px] block uppercase">
              {t.handoffVisualizer.writerLatency}
            </span>
            <span className="font-semibold text-yellow-400">{result.metrics.writerLatencyMs}ms</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-[10px] block uppercase">
              {t.handoffVisualizer.estimatedTokens}
            </span>
            <span className="font-semibold text-emerald-400">~{result.metrics.tokensEstimated}</span>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {steps.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-[var(--text-muted)] space-y-2 border border-dashed border-[var(--border-subtle)] rounded-xs p-4">
            <Bot className="w-8 h-8 opacity-25" />
            <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">
              {t.handoffVisualizer.waitingTitle}
            </p>
            <p className="max-w-[240px] text-[11px]">
              {t.handoffVisualizer.waitingSubtitle}
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
                  className="p-3 my-2 rounded-xs bg-indigo-500/5 border border-indigo-500/30 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{"//"} {t.handoffVisualizer.handoffCardTitle}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[var(--text-muted)] text-[10px] font-mono">
                      <Clock className="w-3 h-3" /> {step.latencyMs}ms
                    </span>
                  </div>
                  <p className="mt-1 text-[var(--text-muted)] text-[11px] font-sans">
                    {t.handoffVisualizer.handoffCardDesc}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={step.id || idx}
                className="rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs overflow-hidden transition-all hover:border-[var(--card-hover-border)]"
              >
                <div
                  onClick={() => toggleExpand(step.id)}
                  className="flex items-center justify-between p-2.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    {getAgentBadge(step.agent)}
                    <span className="font-mono text-[11px] text-[var(--text-primary)]">
                      {localizeStepAction(step.action, locale)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {step.latencyMs}ms
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-2.5 pt-0 border-t border-[var(--border-subtle)]/60 text-[11px] font-mono space-y-1.5 bg-black/20">
                    {step.input !== undefined && (
                      <div>
                        <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold block mb-1">
                          {"//"} {t.handoffVisualizer.inputLabel}:
                        </span>
                        <pre className="p-1.5 rounded-xs bg-black/40 border border-[var(--border-subtle)] overflow-x-auto text-[var(--text-primary)] text-[10px]">
                          {JSON.stringify(step.input, null, 2)}
                        </pre>
                      </div>
                    )}
                    {step.output !== undefined && (
                      <div>
                        <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold block mb-1">
                          {"//"} {t.handoffVisualizer.outputLabel}:
                        </span>
                        <pre className="p-1.5 rounded-xs bg-black/40 border border-[var(--border-subtle)] overflow-x-auto text-[var(--text-primary)] text-[10px]">
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
