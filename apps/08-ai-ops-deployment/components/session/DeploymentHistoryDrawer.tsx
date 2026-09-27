"use client";

import React, { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { RollbackIncidentEvent } from "@/lib/resilience/rollback-trigger";
import { TrafficPolicy } from "@/types/deployment";
import {
  AlertOctagon,
  Clock,
  History,
  Layers,
  ShieldAlert,
  Sliders,
  X,
} from "lucide-react";

interface DeploymentHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: RollbackIncidentEvent[];
  policy: TrafficPolicy;
}

export function DeploymentHistoryDrawer({
  isOpen,
  onClose,
  incidents,
  policy,
}: DeploymentHistoryDrawerProps) {
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl z-10 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/15 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {t.historyDrawer.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {t.historyDrawer.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-[var(--text-primary)]">
          {/* Current Policy Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Sliders className="w-4 h-4" />
              <h4>{t.historyDrawer.policyHistory}</h4>
            </div>
            <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Modo de Operação:</span>
                <span className="font-bold text-blue-400 uppercase">{policy.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Distribuição:</span>
                <span>{policy.blueWeight}% Blue / {policy.greenWeight}% Green</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Rollback Ativo:</span>
                <span className={policy.isRollbackActive ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {policy.isRollbackActive ? "SIM" : "NÃO"}
                </span>
              </div>
              {policy.lastUpdated && (
                <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Última Atualização:</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {new Date(policy.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Incidents Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertOctagon className="w-4 h-4" />
              <h4>{t.historyDrawer.incidentHistory} ({incidents.length})</h4>
            </div>

            {incidents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/40 text-center text-[var(--text-muted)]">
                <p>{t.historyDrawer.noIncidents}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2 font-mono text-[11px]"
                  >
                    <div className="flex items-center justify-between text-rose-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {incident.triggerReason}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(incident.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-[var(--text-primary)]">
                      {incident.metricObserved} • {incident.thresholdViolated}
                    </p>

                    <div className="p-2 rounded bg-rose-500/10 text-rose-200 text-[10px]">
                      {incident.actionTaken}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
