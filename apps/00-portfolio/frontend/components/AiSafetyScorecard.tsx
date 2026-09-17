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
      <section className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {t.sectionTitle}
              </h2>
            </div>
            <p className="text-text-muted text-sm max-w-2xl">
              {t.sectionSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted border border-border text-text-secondary">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{t.evaluated} {AI_SAFETY_SCORECARD.lastEvaluationDate}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.score} {AI_SAFETY_SCORECARD.overallScore}</span>
            </div>
          </div>
        </div>

        {/* Engineering evidence notice */}
        <div className="text-xs bg-primary/5 border border-primary/20 rounded-xl p-3 text-text-secondary flex items-start gap-2">
          <Cpu className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>{t.engineeringEvidenceLabel}</strong>{" "}
            {t.engineeringEvidenceBody.replace("{runner}", "evals/run_evals.py")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_SAFETY_SCORECARD.metrics.map((metric) => {
            const metricDict = t.metrics[metric.id as keyof typeof t.metrics];
            return (
              <div
                key={metric.id}
                className="p-5 rounded-2xl bg-surface-muted/50 border border-border flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider font-semibold text-text-secondary bg-surface border border-border">
                      {metricDict?.category ?? metric.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {metric.score}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-base">
                    {metricDict?.title ?? metric.title}
                  </h3>
                  <p className="text-text-muted text-xs leading-relaxed">
                    {metricDict?.description ?? metric.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveMetricId(metric.id)}
                    className="text-primary hover:underline flex items-center gap-1 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{t.methodologyBtn}</span>
                  </button>
                  <span className="flex items-center gap-1 text-text-muted font-mono">
                    <GitCommit className="w-3 h-3 text-text-secondary" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="methodology-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveMetricId(null)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-wider text-text-secondary">
                  {t.methodologyModalTitle}
                </p>
                <h3
                  id="methodology-modal-title"
                  className="text-lg font-bold text-foreground"
                >
                  {activeMetricDict.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMetricId(null)}
                aria-label={t.closeBtn}
                className="shrink-0 p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-px bg-border" />

            <p className="text-sm text-text-muted leading-relaxed">
              {activeMetricDict.methodology}
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
                <GitCommit className="w-3 h-3" />
                {t.commitLabel}: {activeMetric.measuredCommit}
              </span>
              <button
                type="button"
                onClick={() => setActiveMetricId(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
