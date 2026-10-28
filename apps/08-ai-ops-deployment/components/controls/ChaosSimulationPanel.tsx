"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { ChaosType } from "@/lib/simulation/chaos-injector";
import {
  Bomb,
  Clock,
  Code2,
  Cpu,
  Flame,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface ChaosSimulationPanelProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  chaosType: ChaosType;
  onChaosTypeChange: (type: ChaosType) => void;
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
  onRunSimulation: () => void;
  isLoading: boolean;
  deployEnabled: boolean;
}

export function ChaosSimulationPanel({
  prompt,
  onPromptChange,
  chaosType,
  onChaosTypeChange,
  batchSize,
  onBatchSizeChange,
  onRunSimulation,
  isLoading,
  deployEnabled,
}: ChaosSimulationPanelProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xs bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {"//"} {t.chaos.title}
            </h2>
            <p className="text-[11px] font-sans text-[var(--text-muted)]">
              {t.chaos.subtitle}
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-[var(--bg-card)] border border-[var(--border-subtle)] text-purple-400">
          CHAOS_SIMULATOR_ENGINE
        </span>
      </div>

      {/* Prompt Textarea */}
      <div className="mb-4">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-primary)] mb-1.5">
          {"//"} {t.chaos.testPrompt}
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t.chaos.promptPlaceholder}
          disabled={isLoading}
          className="w-full text-xs font-mono p-2.5 rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] resize-none disabled:opacity-50"
        />
      </div>

      {/* Chaos Fault Injection Selector */}
      <div className="mb-4">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-primary)] mb-2">
          {"//"} {t.chaos.injectChaos}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* None */}
          <button
            onClick={() => onChaosTypeChange("none")}
            disabled={isLoading}
            className={`p-2.5 rounded-xs border text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
              chaosType === "none"
                ? "bg-cyan-500/15 border-cyan-500/50 text-[var(--sre-cyan)] font-bold shadow-sm"
                : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
            }`}
          >
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{t.chaos.none}</p>
              <p className="text-[10px] font-sans text-[var(--text-muted)]">Tráfego saudável padrão</p>
            </div>
          </button>

          {/* Latency Spike */}
          <button
            onClick={() => onChaosTypeChange("latency_spike")}
            disabled={isLoading}
            className={`p-2.5 rounded-xs border text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
              chaosType === "latency_spike"
                ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-bold shadow-sm"
                : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
            }`}
          >
            <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{t.chaos.latencySpike}</p>
              <p className="text-[10px] font-sans text-[var(--text-muted)]">{t.chaos.latencySpikeDesc}</p>
            </div>
          </button>

          {/* Azure 429 Throttle */}
          <button
            onClick={() => onChaosTypeChange("azure_429")}
            disabled={isLoading}
            className={`p-2.5 rounded-xs border text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
              chaosType === "azure_429"
                ? "bg-rose-500/15 border-rose-500/50 text-rose-400 font-bold shadow-sm"
                : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
            }`}
          >
            <Bomb className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            <div>
              <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{t.chaos.azure429}</p>
              <p className="text-[10px] font-sans text-[var(--text-muted)]">{t.chaos.azure429Desc}</p>
            </div>
          </button>

          {/* Prompt Injection */}
          <button
            onClick={() => onChaosTypeChange("prompt_injection")}
            disabled={isLoading}
            className={`p-2.5 rounded-xs border text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
              chaosType === "prompt_injection"
                ? "bg-red-500/15 border-red-500/50 text-red-400 font-bold shadow-sm"
                : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
            }`}
          >
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <div>
              <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{t.chaos.promptInjection}</p>
              <p className="text-[10px] font-sans text-[var(--text-muted)]">{t.chaos.promptInjectionDesc}</p>
            </div>
          </button>

          {/* Schema Corruption */}
          <button
            onClick={() => onChaosTypeChange("schema_corruption")}
            disabled={isLoading}
            className={`p-2.5 rounded-xs border text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
              chaosType === "schema_corruption"
                ? "bg-purple-500/15 border-purple-500/50 text-purple-400 font-bold shadow-sm"
                : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
            }`}
          >
            <Code2 className="w-4 h-4 mt-0.5 shrink-0 text-purple-400" />
            <div>
              <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{t.chaos.schemaCorruption}</p>
              <p className="text-[10px] font-sans text-[var(--text-muted)]">{t.chaos.schemaCorruptionDesc}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Batch Size Selector and Execution Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3.5 border-t border-[var(--border-subtle)] font-mono">
        {/* Batch Size */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase">
            {t.chaos.batchSize}:
          </span>
          {[1, 3, 5, 10].map((size) => (
            <button
              key={size}
              onClick={() => onBatchSizeChange(size)}
              disabled={isLoading}
              className={`px-2 py-0.5 rounded-xs text-xs font-mono font-bold border transition-colors cursor-pointer ${
                batchSize === size
                  ? "bg-cyan-500/20 text-[var(--sre-cyan)] border-[var(--border-active)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
              }`}
            >
              {size}x
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onRunSimulation}
          disabled={isLoading || !deployEnabled || !prompt.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-xs text-xs font-mono font-bold uppercase tracking-wider text-black bg-[var(--sre-cyan)] hover:bg-cyan-400 border border-cyan-400 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>{t.common.executing}</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>{batchSize > 1 ? t.chaos.burstTraffic : t.chaos.runSimulation} ↵</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
