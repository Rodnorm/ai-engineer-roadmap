"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HandoffVisualizer } from "@/components/trace/HandoffVisualizer";
import { BriefViewer } from "@/components/brief/BriefViewer";
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
  ArrowRight,
  Layers,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

const SAMPLE_SCENARIOS = [
  {
    title: "Monólito Modular vs Microsserviços",
    topic: "Avaliação comparativa de transição de um e-commerce em monólito para monólito modular vs microsserviços orientados a eventos.",
    scope: "Arquitetura e Latência de Rede",
    tone: "technical" as BriefTone,
  },
  {
    title: "Zero Trust em Nuvem Híbrida",
    topic: "Estratégia de modernização de segurança para uma empresa financeira migrando para modelo Zero Trust em nuvem híbrida (Azure e On-Premises).",
    scope: "Segurança e Conformidade LGPD/BACEN",
    tone: "executive" as BriefTone,
  },
  {
    title: "RAG Privado vs Fine-Tuning de SLM",
    topic: "Trade-offs técnicos e de custo entre arquitetura RAG com Azure AI Search vs Fine-Tuning de SLMs para análise de contratos jurídicos.",
    scope: "Inteligência Artificial e FinOps",
    tone: "critical" as BriefTone,
  },
];

export default function HomePage() {
  const [topic, setTopic] = useState(SAMPLE_SCENARIOS[0].topic);
  const [scope, setScope] = useState(SAMPLE_SCENARIOS[0].scope);
  const [tone, setTone] = useState<BriefTone>("executive");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Execution state
  const [steps, setSteps] = useState<AgentTraceStep[]>([]);
  const [dossier, setDossier] = useState<ResearchDossier | null>(null);
  const [brief, setBrief] = useState<ExecutiveBrief | null>(null);
  const [result, setResult] = useState<PipelineExecutionResult | null>(null);

  const handleSelectScenario = (scenario: (typeof SAMPLE_SCENARIOS)[0]) => {
    setTopic(scenario.topic);
    setScope(scenario.scope);
    setTone(scenario.tone);
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
        body: JSON.stringify({ topic, scope, tone }),
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
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Top Control Panel */}
        <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--accent-agent-research)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Parâmetros da Investigação & Síntese
              </h2>
            </div>
            {/* Scenarios chips */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Cenários Rápidos:
              </span>
              {SAMPLE_SCENARIOS.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectScenario(sc)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-all"
                >
                  {sc.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label
                htmlFor="topic-input"
                className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
              >
                Tema / Pergunta de Pesquisa
              </label>
              <textarea
                id="topic-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                placeholder="Ex: Análise comparativa de migração de arquitetura..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-agent-research)] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Escopo de Análise
                </label>
                <input
                  type="text"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Ex: Engenharia e Custos"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-agent-research)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Tom da Redação
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as BriefTone)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-agent-writer)]"
                >
                  <option value="executive">Executivo (Foco em Decisão & Riscos)</option>
                  <option value="technical">Técnico (Foco em Arquitetura & Código)</option>
                  <option value="critical">Crítico (Foco em Trade-offs & Fricção)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Investigando & Redigindo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gerar Briefing Executivo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="font-medium">{error}</p>
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
    </div>
  );
}
