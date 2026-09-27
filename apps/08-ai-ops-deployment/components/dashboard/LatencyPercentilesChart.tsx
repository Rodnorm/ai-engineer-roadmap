"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { DeploymentMetrics } from "@/types/metrics";
import { BarChart3, CheckCircle, Clock } from "lucide-react";

interface LatencyPercentilesChartProps {
  metrics: DeploymentMetrics;
}

export function LatencyPercentilesChart({ metrics }: LatencyPercentilesChartProps) {
  const { t } = useI18n();

  const percentiles = [
    { label: "P50 (Mediana)", blue: metrics.bluePercentiles.p50, green: metrics.greenPercentiles.p50 },
    { label: "P90", blue: metrics.bluePercentiles.p90, green: metrics.greenPercentiles.p90 },
    { label: "P95 (SLO Gate)", blue: metrics.bluePercentiles.p95, green: metrics.greenPercentiles.p95 },
    { label: "P99 (Worst Case)", blue: metrics.bluePercentiles.p99, green: metrics.greenPercentiles.p99 },
  ];

  const maxVal = Math.max(
    100,
    metrics.bluePercentiles.p99,
    metrics.greenPercentiles.p99,
    metrics.slo.maxP95LatencyMs
  );

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Distribuição de Latência (Blue vs Green)
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Comparação percentilar em tempo real com linha de referência de SLO
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-blue-400 font-bold">Blue (gpt-4o)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-emerald-400 font-bold">Green (gpt-4o-mini)</span>
          </div>
        </div>
      </div>

      {/* Percentiles Bar Rows */}
      <div className="space-y-4">
        {percentiles.map((p) => {
          const blueWidth = Math.min(100, Math.round((p.blue / maxVal) * 100));
          const greenWidth = Math.min(100, Math.round((p.green / maxVal) * 100));

          return (
            <div key={p.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-[var(--text-primary)]">{p.label}</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-blue-400 font-bold">{p.blue}ms</span>
                  <span className="text-[var(--text-muted)]">|</span>
                  <span className="text-emerald-400 font-bold">{p.green}ms</span>
                </div>
              </div>

              {/* Blue Bar */}
              <div className="h-2 w-full bg-[var(--bg-card)] rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, blueWidth)}%` }}
                />
              </div>

              {/* Green Bar */}
              <div className="h-2 w-full bg-[var(--bg-card)] rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    p.green > metrics.slo.maxP95LatencyMs ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(2, greenWidth)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary Comparison */}
      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[var(--border-subtle)] text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <p className="text-[var(--text-muted)] text-[10px]">CUSTO BLUE (gpt-4o)</p>
          <p className="text-sm font-bold text-blue-400 mt-0.5">${metrics.blue.totalCostUsd}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{metrics.blue.totalTokens} tokens</p>
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <p className="text-[var(--text-muted)] text-[10px]">CUSTO GREEN (gpt-4o-mini)</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">${metrics.green.totalCostUsd}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{metrics.green.totalTokens} tokens</p>
        </div>
      </div>
    </div>
  );
}
