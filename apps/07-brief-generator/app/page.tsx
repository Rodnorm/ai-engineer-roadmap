"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { HandoffVisualizer } from "@/components/trace/HandoffVisualizer";
import { BriefViewer } from "@/components/brief/BriefViewer";
import { AppInfoDrawer } from "@/components/info/AppInfoDrawer";
import { SessionHistoryDrawer } from "@/components/session/SessionHistoryDrawer";
import {
  COMPLETE_SCENARIOS,
  QuickScenarios,
  ScenarioItem,
} from "@/components/suggestions/QuickScenarios";
import { StoredBrief } from "@/lib/session/brief-repository";
import {
  AgentTraceStep,
  BriefTone,
  ExecutiveBrief,
  PipelineEvent,
  PipelineExecutionResult,
  ResearchDossier,
} from "@/types/agent";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

import { useI18n } from "@/lib/i18n/context";
import { LocalizedScenario } from "@/lib/i18n/types";

export default function HomePage() {
  const { t, locale } = useI18n();
  const [topic, setTopic] = useState(COMPLETE_SCENARIOS[0].topic);
  const [scope, setScope] = useState(COMPLETE_SCENARIOS[0].scope);
  const [tone, setTone] = useState<BriefTone>("executive");
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial scenario when language changes if user hasn't edited
  useEffect(() => {
    if (!hasUserEdited && t.scenarios.items?.[0]) {
      setTopic(t.scenarios.items[0].topic);
      setScope(t.scenarios.items[0].scope);
      setTone(t.scenarios.items[0].tone);
    }
  }, [locale, t, hasUserEdited]);

  // Drawers state
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);

  // Execution state
  const [steps, setSteps] = useState<AgentTraceStep[]>([]);
  const [dossier, setDossier] = useState<ResearchDossier | null>(null);
  const [brief, setBrief] = useState<ExecutiveBrief | null>(null);
  const [result, setResult] = useState<PipelineExecutionResult | null>(null);
  const [briefsCount, setBriefsCount] = useState(0);

  // Load initial briefs count
  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((d) => setBriefsCount(d.briefsCount || 0))
      .catch(() => {});
  }, []);

  const handleSelectScenario = (scenario: ScenarioItem | LocalizedScenario) => {
    setTopic(scenario.topic);
    setScope(scenario.scope);
    setTone(scenario.tone);
    setHasUserEdited(true);
    setIsScenariosOpen(false);
  };

  const handleSelectHistoricalBrief = (historical: StoredBrief) => {
    setTopic(historical.topic);
    setScope(historical.scope);
    setTone(historical.tone);
    setBrief(historical.result.brief);
    setDossier(historical.result.dossier);
    setSteps(historical.result.trace);
    setResult(historical.result);
    setHasUserEdited(true);
    setError(null);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setSteps([]);
    setDossier(null);
    setBrief(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, scope, tone, locale }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erro HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Resposta sem corpo legível para streaming.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: PipelineEvent = JSON.parse(line.slice(6));
              if (event.type === "step" && event.step) {
                setSteps((prev) => {
                  const filtered = prev.filter((s) => s.id !== event.step!.id);
                  return [...filtered, event.step!];
                });
              } else if (event.type === "dossier" && event.dossier) {
                setDossier(event.dossier);
              } else if (event.type === "complete" && event.result) {
                setResult(event.result);
                setBrief(event.result.brief);
                setDossier(event.result.dossier);
                setSteps(event.result.trace);
                setBriefsCount((prev) => prev + 1);
              } else if (event.type === "error") {
                setError(event.error || "Erro durante a execução do pipeline.");
              }
            } catch (jsonErr) {
              console.warn("Falha ao parsear evento SSE:", jsonErr);
            }
          }
        }
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Falha ao conectar com o serviço."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[var(--bg-primary)]">
      <Header
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        briefsCount={briefsCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Top Control Panel */}
        <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[var(--dossier-accent)]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {"//"} {t.controlPanel.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsScenariosOpen(!isScenariosOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono font-semibold uppercase tracking-wider border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors cursor-pointer"
            >
              <Zap className="w-3 h-3 text-[var(--dossier-accent)]" />
              <span>{t.controlPanel.scenariosBtn}</span>
              {isScenariosOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Collapsible 12-scenario catalogue */}
          {isScenariosOpen && (
            <div className="mb-5 p-4 rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-card)]/40 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-3.5 h-3.5 text-[var(--dossier-accent)]" />
                <h3 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  {"//"} {t.controlPanel.scenariosCatalogTitle}
                </h3>
              </div>
              <QuickScenarios
                onSelect={handleSelectScenario}
                activeTopic={topic}
              />
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label
                htmlFor="topic-input"
                className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
              >
                {"//"} {t.controlPanel.topicLabel}
              </label>
              <textarea
                id="topic-input"
                maxLength={300}
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setHasUserEdited(true);
                }}
                rows={2}
                placeholder={t.controlPanel.topicPlaceholder}
                className="w-full px-3 py-2 text-xs font-mono rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--dossier-accent)] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  {"//"} {t.controlPanel.scopeLabel}
                </label>
                <input
                  type="text"
                  maxLength={1000}
                  value={scope}
                  onChange={(e) => {
                    setScope(e.target.value);
                    setHasUserEdited(true);
                  }}
                  placeholder={t.controlPanel.scopePlaceholder}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--dossier-accent)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  {"//"} {t.controlPanel.toneLabel}
                </label>
                <select
                  value={tone}
                  onChange={(e) => {
                    setTone(e.target.value as BriefTone);
                    setHasUserEdited(true);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--dossier-accent)]"
                >
                  <option value="executive">{t.controlPanel.toneExecutive}</option>
                  <option value="technical">{t.controlPanel.toneTechnical}</option>
                  <option value="critical">{t.controlPanel.toneCritical}</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xs text-xs font-mono font-bold uppercase tracking-wider text-black bg-[var(--dossier-accent)] hover:bg-yellow-400 border border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.controlPanel.generatingBtn}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.controlPanel.generateBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xs bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="font-medium">{"//"} ERROR: {error}</p>
          </div>
        )}

        {/* Dual Panel Execution Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[550px]">
          {/* Left Panel: Handoff Trace */}
          <div className="lg:col-span-5 h-[550px] lg:h-auto">
            <HandoffVisualizer
              steps={steps}
              isLoading={isLoading}
              result={result}
            />
          </div>

          {/* Right Panel: Executive Brief & Raw Dossier */}
          <div className="lg:col-span-7 h-[550px] lg:h-auto">
            <BriefViewer
              brief={brief}
              dossier={dossier}
              isLoading={isLoading}
            />
          </div>
        </section>
      </main>

      {/* Info Slide-over Drawer */}
      <AppInfoDrawer
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Session History Drawer */}
      <SessionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectBrief={handleSelectHistoricalBrief}
      />
    </div>
  );
}
