import { AI_SAFETY_SCORECARD } from "@/lib/scorecard";
import { ShieldCheck, CheckCircle2, GitCommit, ExternalLink, Calendar, Cpu } from "lucide-react";

export function AiSafetyScorecard() {
  return (
    <section className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              AI Reliability & Safety Scorecard
            </h2>
          </div>
          <p className="text-text-muted text-sm max-w-2xl">
            Reproducible engineering evidence measured by deterministic evaluation suites. Every score is linked to a versioned dataset, test, and commit hash.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted border border-border text-text-secondary">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Evaluated: {AI_SAFETY_SCORECARD.lastEvaluationDate}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Score: {AI_SAFETY_SCORECARD.overallScore}</span>
          </div>
        </div>
      </div>

      {/* Distinction notice */}
      <div className="text-xs bg-primary/5 border border-primary/20 rounded-xl p-3 text-text-secondary flex items-start gap-2">
        <Cpu className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Engineering Evidence:</strong> These results are measured by the continuous integration test runner (<code className="font-mono text-primary">evals/run_evals.py</code>) running synthetic benchmarks without paid API calls or user data.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_SAFETY_SCORECARD.metrics.map((metric) => (
          <div
            key={metric.id}
            className="p-5 rounded-2xl bg-surface-muted/50 border border-border flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider font-semibold text-text-secondary bg-surface border border-border">
                  {metric.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {metric.score}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-base">{metric.title}</h3>
              <p className="text-text-muted text-xs leading-relaxed">{metric.description}</p>
            </div>

            <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs">
              <a
                href={metric.methodologyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <span>Methodology</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="flex items-center gap-1 text-text-muted font-mono">
                <GitCommit className="w-3 h-3 text-text-secondary" />
                <span>{metric.measuredCommit}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
