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
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-[var(--border-subtle)] rounded-xs bg-[var(--bg-surface)] p-8 text-center">
        <FileText className="w-10 h-10 text-[var(--text-muted)] opacity-20 mb-3" />
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
          {"//"} {t.briefViewer.emptyTitle}
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1.5 font-sans">
          {t.briefViewer.emptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs overflow-hidden shadow-sm">
      {/* Tab Switcher & Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("brief")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
              activeTab === "brief"
                ? "bg-[var(--dossier-accent)] text-black border-[var(--dossier-accent)] font-bold shadow-sm"
                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)]"
            }`}
          >
            <FileText className="w-3 h-3" /> 01 :: {t.briefViewer.tabBrief}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dossier")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
              activeTab === "dossier"
                ? "bg-sky-500 text-black border-sky-500 font-bold shadow-sm"
                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)]"
            }`}
          >
            <Database className="w-3 h-3" /> 02 :: {t.briefViewer.tabDossier}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {brief && (
            <>
              <button
                type="button"
                onClick={handleCopyMarkdown}
                title={t.briefViewer.copyMarkdown}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs text-xs font-mono font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">{t.briefViewer.copied}</span>
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs text-xs font-mono font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors cursor-pointer"
              >
                <Printer className="w-3 h-3" />
                <span>{t.briefViewer.print}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-brief,var(--bg-surface))]">
        {isLoading && !brief && !dossier ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3 font-mono">
            <div className="w-8 h-8 rounded-xs border-2 border-[var(--dossier-accent)] border-t-transparent animate-spin" />
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider animate-pulse">
              {"//"} ORCHESTRATING_RESEARCHER_AND_WRITER...
            </p>
          </div>
        ) : activeTab === "brief" && brief ? (
          <div className="brief-prose max-w-none text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-[var(--border-subtle)]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--dossier-accent)]">
                {"//"} CLASSIFIED_EXECUTIVE_BRIEFING
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                FORMAT: DECLASSIFIED_MEMO
              </span>
            </div>

            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {brief.title}
            </h1>

            <div className="my-4 p-4 rounded-xs bg-[var(--bg-card)] border-l-2 border-l-[var(--dossier-accent)] border border-[var(--border-subtle)]">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--dossier-accent)] mb-1.5">
                {"//"} {t.briefViewer.executiveSummaryLabel}
              </h4>
              <p className="text-sm leading-relaxed m-0 text-[var(--text-primary)]">
                {brief.executiveSummary}
              </p>
            </div>

            <h2>{t.briefViewer.keyInsightsHeading}</h2>
            <ul>
              {brief.keyInsights.map((insight, idx) => (
                <li key={idx} className="text-sm">
                  {insight}
                </li>
              ))}
            </ul>

            {dossier && dossier.metrics.length > 0 && (
              <>
                <h2>{t.briefViewer.metricsHeading}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
                  {dossier.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)]"
                    >
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
                        <span className="uppercase text-[10px]">{metric.label}</span>
                        <TrendingUp className="w-3 h-3 text-[var(--dossier-accent)]" />
                      </div>
                      <div className="text-base font-bold text-[var(--text-primary)] mt-1 font-mono">
                        {metric.value}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-1 font-sans">
                        {metric.context}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h2>{t.briefViewer.risksHeading}</h2>
            <ul>
              {brief.risksAndTradeoffs.map((risk, idx) => (
                <li key={idx} className="text-sm text-amber-500/90 font-medium">
                  {risk}
                </li>
              ))}
            </ul>

            <h2>{t.briefViewer.recommendationsHeading}</h2>
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
            <div className="p-3.5 rounded-xs bg-sky-500/5 border border-sky-500/25">
              <div className="flex items-center gap-2 font-mono font-bold text-sky-400 text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{"//"} {t.briefViewer.tabDossier} :: VERIFIED_INTELLIGENCE</span>
              </div>
              <p className="text-[var(--text-muted)] text-xs mt-1.5 font-sans leading-relaxed">
                {dossier.summary}
              </p>
            </div>

            <div>
              <h4 className="font-mono uppercase font-bold text-[var(--text-primary)] text-xs tracking-wider mb-2">
                {"//"} {t.briefViewer.dossierFactsTitle} ({dossier.verifiedFacts.length})
              </h4>
              <div className="space-y-2">
                {dossier.verifiedFacts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-card)]"
                  >
                    <div className="text-[var(--text-primary)] font-sans text-xs font-medium">
                      {fact.claim}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono">
                      <span>{t.briefViewer.sourceLabel}: {fact.source}</span>
                      <span className="text-emerald-400 font-semibold px-1.5 py-0.5 rounded-xs bg-emerald-500/10 border border-emerald-500/20">
                        {t.briefViewer.confidenceLabel}: {(fact.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-mono uppercase font-bold text-[var(--text-primary)] text-xs tracking-wider mb-2">
                {"//"} {t.briefViewer.dossierFrictionTitle} ({dossier.frictionPoints.length})
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-[var(--text-muted)] font-sans text-xs">
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
