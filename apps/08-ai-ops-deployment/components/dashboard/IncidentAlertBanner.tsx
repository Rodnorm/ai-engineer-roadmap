"use client";

import React from "react";
import { RollbackIncidentEvent } from "@/lib/resilience/rollback-trigger";
import { AlertOctagon, CheckCircle2, ShieldAlert, X } from "lucide-react";

interface IncidentAlertBannerProps {
  incidents: RollbackIncidentEvent[];
  isRollbackActive?: boolean;
  onClear: () => void;
}

export function IncidentAlertBanner({
  incidents,
  isRollbackActive,
  onClear,
}: IncidentAlertBannerProps) {
  if (!isRollbackActive && (!incidents || incidents.length === 0)) {
    return null;
  }

  const latest = incidents[0];

  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 shadow-sm relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-white">
                CRITICAL INCIDENT
              </span>
              <span className="text-xs font-mono text-rose-300">
                {latest ? new Date(latest.timestamp).toLocaleTimeString() : ""}
              </span>
            </div>
            <h4 className="text-sm font-bold text-rose-200 mt-1">
              {latest ? latest.triggerReason : "Rollback Automático Ativo"}
            </h4>
            {latest && (
              <p className="text-xs text-rose-300/80 mt-0.5 font-mono">
                {latest.metricObserved} • {latest.thresholdViolated}
              </p>
            )}
            <p className="text-xs text-rose-200 font-semibold mt-2">
              Ação de Segurança Executada: 100% do tráfego revertido para Blue (gpt-4o) para manter a disponibilidade de produção.
            </p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
          title="Fechar Alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
