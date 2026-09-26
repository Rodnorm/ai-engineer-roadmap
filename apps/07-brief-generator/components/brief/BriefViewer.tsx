"use client";

import React, { useState } from "react";
import { ExecutiveBrief, ResearchDossier } from "@/types/agent";
import {
  Check,
  Copy,
  Database,
  FileText,
  Printer,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

interface BriefViewerProps {
  brief?: ExecutiveBrief | null;
  dossier?: ResearchDossier | null;
  isLoading: boolean;
}

export function BriefViewer({ brief, dossier, isLoading }: BriefViewerProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"brief" | "dossier">("brief");
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(brief.fullMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!brief && !dossier && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] p-8 text-center">
        <FileText className="w-12 h-12 text-[var(--text-muted)] opacity-30 mb-3" />
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {t.briefViewer.emptyTitle}
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1">
          {t.briefViewer.emptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
      {/* Tab Switcher & Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("brief")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "brief"
                ? "bg-[var(--accent-agent-writer)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> {t.briefViewer.tabBrief}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dossier")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "dossier"
                ? "bg-[var(--accent-agent-research)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> {t.briefViewer.tabDossier}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {brief && (
            <>
              <button
                type="button"
                onClick={handleCopyMarkdown}
                title={t.briefViewer.copyMarkdown}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500">{t.briefViewer.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t.briefViewer.copyMarkdown}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                title={t.briefViewer.print}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors cursor-pointer"
              >
                <Printer className="w-3 h-3" />
                <span>{t.briefViewer.print}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && !brief && !dossier ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-sky-500 border-l-transparent animate-spin" />
            <p className="text-xs text-[var(--text-muted)] animate-pulse">
              Orquestrando Researcher e Writer...
            </p>
          </div>
        ) : activeTab === "brief" && brief ? (
          <div className="brief-prose max-w-none text-[var(--text-primary)]">
            <h1 className="text-xl font-bold border-b border-[var(--border-subtle)] pb-2">
              {brief.title}
            </h1>

            <div className="my-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <h4 className="text-xs uppercase font-bold tracking-wider text-violet-400 mb-1">
                Sumário Executivo (PR-FAQ Style)
              </h4>
              <p className="text-sm leading-relaxed m-0 text-[var(--text-primary)]">
                {brief.executiveSummary}
              </p>
            </div>

            <h2>Evidências Fundamentais do Estudo</h2>
            <ul>
              {brief.keyInsights.map((insight, idx) => (
                <li key={idx} className="text-sm">
                  {insight}
                </li>
              ))}
            </ul>

            {dossier && dossier.metrics.length > 0 && (
              <>
                <h2>Métricas & Indicadores de Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
                  {dossier.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]"
                    >
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>{metric.label}</span>
                        <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <div className="text-base font-bold text-[var(--text-primary)] mt-1 font-mono">
                        {metric.value}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-1">
                        {metric.context}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h2>Riscos, Restrições & Trade-offs Críticos</h2>
            <ul>
              {brief.risksAndTradeoffs.map((risk, idx) => (
                <li key={idx} className="text-sm text-amber-500/90 font-medium">
                  {risk}
                </li>
              ))}
            </ul>

            <h2>Recomendações Estratégicas de Ação</h2>
            <ol>
              {brief.actionRecommendations.map((action, idx) => (
                <li key={idx} className="text-sm">
                  {action}
                </li>
              ))}
            </ol>
          </div>
        ) : activeTab === "dossier" && dossier ? (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 font-sans">
              <div className="flex items-center gap-2 font-semibold text-sky-400">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.briefViewer.tabDossier}</span>
              </div>
              <p className="text-[var(--text-muted)] text-xs mt-1">
                {dossier.summary}
              </p>
            </div>

            <div>
              <h4 className="font-sans font-bold text-[var(--text-primary)] text-sm mb-2">
                {t.briefViewer.dossierFactsTitle} ({dossier.verifiedFacts.length})
              </h4>
              <div className="space-y-2">
                {dossier.verifiedFacts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)]"
                  >
                    <div className="text-[var(--text-primary)] font-medium">
                      {fact.claim}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-muted)]">
                      <span>{t.briefViewer.sourceLabel}: {fact.source}</span>
                      <span className="text-emerald-400">
                        {t.briefViewer.confidenceLabel}: {(fact.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-sans font-bold text-[var(--text-primary)] text-sm mb-2">
                {t.briefViewer.dossierFrictionTitle} ({dossier.frictionPoints.length})
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-[var(--text-muted)] font-sans">
                {dossier.frictionPoints.map((fp, idx) => (
                  <li key={idx}>{fp}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
