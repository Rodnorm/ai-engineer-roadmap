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
    <div className="rounded-xs border border-rose-500/40 bg-rose-500/10 p-3.5 shadow-sm relative overflow-hidden font-mono">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xs bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0 flex items-center justify-center">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-rose-500 text-white">
                CRITICAL_INCIDENT
              </span>
              <span className="text-xs font-mono text-rose-300">
                {latest ? new Date(latest.timestamp).toLocaleTimeString() : ""}
              </span>
            </div>
            <h4 className="text-xs font-bold text-rose-200 mt-1 uppercase tracking-wider">
              {"//"} {latest ? latest.triggerReason : "Rollback Automático Ativo"}
            </h4>
            {latest && (
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                {latest.metricObserved} • {latest.thresholdViolated}
              </p>
            )}
            <p className="text-[11px] text-rose-200 font-sans mt-1.5">
              Ação de Segurança Executada: 100% do tráfego revertido para Blue (gpt-4o) para manter a disponibilidade de produção.
            </p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="w-7 h-7 rounded-xs border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
          title="Fechar Alerta"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
