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
    <div className="rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xs bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[var(--sre-cyan)]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {"//"} DISTRIBUIÇÃO DE LATÊNCIA (BLUE VS GREEN)
            </h3>
            <p className="text-[11px] font-sans text-[var(--text-muted)]">
              Comparação percentilar em tempo real com linha de referência de SLO
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[var(--sre-cyan)]" />
            <span className="text-[var(--sre-cyan)] font-bold">Blue (gpt-4o)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-emerald-400" />
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
            <div key={p.label} className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="font-semibold text-[var(--text-primary)]">{p.label}</span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-[var(--sre-cyan)] font-bold">{p.blue}ms</span>
                  <span className="text-[var(--text-muted)]">::</span>
                  <span className="text-emerald-400 font-bold">{p.green}ms</span>
                </div>
              </div>

              {/* Blue Bar */}
              <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-xs overflow-hidden flex border border-[var(--border-subtle)]">
                <div
                  className="bg-[var(--sre-cyan)] h-full transition-all duration-500"
                  style={{ width: `${Math.max(2, blueWidth)}%` }}
                />
              </div>

              {/* Green Bar */}
              <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-xs overflow-hidden flex border border-[var(--border-subtle)]">
                <div
                  className={`h-full transition-all duration-500 ${
                    p.green > metrics.slo.maxP95LatencyMs ? "bg-rose-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.max(2, greenWidth)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary Comparison */}
      <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-[var(--border-subtle)] text-xs font-mono">
        <div className="p-2.5 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <p className="text-[var(--text-muted)] text-[10px] uppercase">CUSTO BLUE (gpt-4o)</p>
          <p className="text-sm font-bold text-[var(--sre-cyan)] mt-0.5">${metrics.blue.totalCostUsd}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{metrics.blue.totalTokens} tokens</p>
        </div>

        <div className="p-2.5 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <p className="text-[var(--text-muted)] text-[10px] uppercase">CUSTO GREEN (gpt-4o-mini)</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">${metrics.green.totalCostUsd}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{metrics.green.totalTokens} tokens</p>
        </div>
      </div>
    </div>
  );
}
