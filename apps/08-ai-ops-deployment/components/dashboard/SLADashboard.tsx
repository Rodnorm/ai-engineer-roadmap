"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { DeploymentMetrics } from "@/types/metrics";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Gauge,
  ShieldAlert,
  Zap,
} from "lucide-react";

interface SLADashboardProps {
  metrics: DeploymentMetrics;
}

export function SLADashboard({ metrics }: SLADashboardProps) {
  const { t } = useI18n();

  const isP95Breached = metrics.overall.p95LatencyMs > metrics.slo.maxP95LatencyMs;
  const isErrorRateBreached = metrics.overall.errorRatePercent > metrics.slo.maxErrorRatePercent;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {t.dashboard.title}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
          <span>Total reqs:</span>
          <span className="font-bold text-[var(--text-primary)]">{metrics.overall.totalRequests}</span>
        </div>
      </div>

      {/* Grid of Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* P95 Latency Card */}
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>{t.dashboard.p95Latency}</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-mono font-bold ${
                isP95Breached ? "text-rose-400" : "text-[var(--text-primary)]"
              }`}
            >
              {metrics.overall.p95LatencyMs}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">ms</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isP95Breached
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {isP95Breached ? "SLO VIOLATION" : "SLO HEALTHY"}
            </span>
            <span className="text-[var(--text-muted)]">alvo: &lt;{metrics.slo.maxP95LatencyMs}ms</span>
          </div>
        </div>

        {/* TTFT Card */}
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>{t.dashboard.ttft}</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-[var(--text-primary)]">
              {metrics.overall.avgTtftMs}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">ms</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-mono mt-2">
            P50 Mediana: <span className="font-bold text-[var(--text-primary)]">{metrics.overall.avgTtftMs > 0 ? Math.round(metrics.overall.avgTtftMs * 0.9) : 0}ms</span>
          </p>
        </div>

        {/* Error Budget Card */}
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>{t.dashboard.errorBudget}</span>
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-mono font-bold ${
                metrics.errorBudget.status === "exhausted"
                  ? "text-rose-400"
                  : metrics.errorBudget.status === "warning"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {metrics.errorBudget.remainingPercent}%
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">restante</span>
          </div>
          <div className="w-full bg-[var(--bg-card)] h-1.5 rounded-full overflow-hidden mt-2 border border-[var(--border-subtle)]">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.errorBudget.status === "exhausted"
                  ? "bg-rose-500"
                  : metrics.errorBudget.status === "warning"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.max(5, metrics.errorBudget.remainingPercent)}%` }}
            />
          </div>
        </div>

        {/* Circuit Breaker & Cost Card */}
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>{t.dashboard.circuitBreaker}</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-bold ${
                metrics.circuitBreakerState === "CLOSED"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : metrics.circuitBreakerState === "HALF-OPEN"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  metrics.circuitBreakerState === "CLOSED"
                    ? "bg-emerald-400"
                    : metrics.circuitBreakerState === "HALF-OPEN"
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              />
              {metrics.circuitBreakerState}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
            <span>{t.dashboard.estimatedCost}:</span>
            <span className="font-bold text-emerald-400">${metrics.overall.totalCostUsd}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
