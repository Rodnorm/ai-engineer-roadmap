"use client";

import { useState } from "react";
import { AI_SAFETY_SCORECARD } from "@/lib/scorecard";
import { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ShieldCheck, CheckCircle2, GitCommit, BookOpen, Calendar, Cpu, X } from "lucide-react";

interface Props {
  dict: Dictionary;
}

export function AiSafetyScorecard({ dict }: Props) {
  const t = dict.scorecard;
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const activeMetric = AI_SAFETY_SCORECARD.metrics.find((m) => m.id === activeMetricId);
  const activeMetricDict = activeMetricId
    ? t.metrics[activeMetricId as keyof typeof t.metrics]
    : null;

  return (
    <>
      <section className="rounded-xs bg-surface border border-border p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-mono font-bold uppercase tracking-wider text-foreground">
                {"// "}{t.sectionTitle}
              </h2>
            </div>
            <p className="text-text-muted text-xs font-mono max-w-2xl">
              {t.sectionSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-surface-muted border border-border text-text-secondary text-[11px]">
              <Calendar className="w-3 h-3 text-text-muted" />
              <span>[EVAL: {AI_SAFETY_SCORECARD.lastEvaluationDate}]</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold text-[11px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>[PASS: {AI_SAFETY_SCORECARD.overallScore}]</span>
            </div>
          </div>
        </div>

        {/* Engineering evidence notice */}
        <div className="text-xs font-mono bg-surface-muted border border-border rounded-xs p-3 text-text-secondary flex items-start gap-2">
          <Cpu className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground">{t.engineeringEvidenceLabel}</strong>{" "}
            {t.engineeringEvidenceBody.replace("{runner}", "evals/run_evals.py")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_SAFETY_SCORECARD.metrics.map((metric) => {
            const metricDict = t.metrics[metric.id as keyof typeof t.metrics];
            return (
              <div
                key={metric.id}
                className="p-4 sm:p-5 rounded-xs bg-surface-card border border-border flex flex-col justify-between space-y-3 hover:border-text-muted transition-all font-mono"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-xs text-[10px] uppercase tracking-wider font-semibold text-text-secondary bg-surface border border-border">
                      {metricDict?.category ?? metric.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                      <CheckCircle2 className="w-3 h-3" />
                      [{metric.score}]
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-foreground text-sm">
                    {metricDict?.title ?? metric.title}
                  </h3>
                  <p className="text-text-muted font-sans text-xs leading-relaxed">
                    {metricDict?.description ?? metric.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveMetricId(metric.id)}
                    className="text-foreground hover:text-accent flex items-center gap-1 font-mono uppercase tracking-wider font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>[ {t.methodologyBtn} ]</span>
                  </button>
                  <span className="flex items-center gap-1 text-text-muted">
                    <GitCommit className="w-3 h-3 text-text-muted" />
                    <span>{metric.measuredCommit}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Methodology Modal */}
      {activeMetricId && activeMetric && activeMetricDict && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono"
          role="dialog"
          aria-modal="true"
          aria-labelledby="methodology-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setActiveMetricId(null)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg rounded-xs bg-surface border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-text-secondary">
                  {"// "}{t.methodologyModalTitle}
                </p>
                <h3
                  id="methodology-modal-title"
                  className="text-base font-bold text-foreground font-sans"
                >
                  {activeMetricDict.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMetricId(null)}
                aria-label={t.closeBtn}
                className="shrink-0 p-1.5 rounded-xs border border-border text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-px bg-border" />

            <p className="text-xs text-text-muted leading-relaxed font-sans">
              {activeMetricDict.methodology}
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                <GitCommit className="w-3 h-3" />
                {t.commitLabel}: {activeMetric.measuredCommit}
              </span>
              <button
                type="button"
                onClick={() => setActiveMetricId(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xs bg-foreground text-background hover:bg-foreground/90 transition-colors uppercase tracking-wider"
              >
                [ {t.closeBtn} ]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
