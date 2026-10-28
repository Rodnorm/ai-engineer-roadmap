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
            <div className="w-8 h-8 rounded-xs border border-[var(--sre-cyan)]/30 bg-[var(--sre-cyan)]/10 flex items-center justify-center text-[var(--sre-cyan)] shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--sre-cyan)] font-semibold">
                  AUDIT_LOG :: INCIDENTS
                </span>
              </div>
              <h3 className="text-sm font-mono font-bold text-[var(--text-primary)] tracking-tight">
                {t.historyDrawer.title}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">
                {t.historyDrawer.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xs border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--sre-cyan)]/40 hover:bg-[var(--bg-card)] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-[var(--text-primary)]">
          {/* Current Policy Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--sre-cyan)] font-mono font-semibold text-xs uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <h4>{"// "}{t.historyDrawer.policyHistory}</h4>
            </div>
            <div className="p-3.5 rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-card)] font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">MODO_OPERACAO:</span>
                <span className="font-bold text-[var(--sre-cyan)] uppercase tracking-wider">
                  [{policy.mode}]
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">DISTRIBUICAO:</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {policy.blueWeight}% Blue / {policy.greenWeight}% Green
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">ROLLBACK_ATIVO:</span>
                <span className={policy.isRollbackActive ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {policy.isRollbackActive ? "[ATIVO - REVERTIDO]" : "[NOMINAL]"}
                </span>
              </div>
              {policy.lastUpdated && (
                <div className="flex justify-between pt-1.5 border-t border-[var(--border-subtle)] text-[10px]">
                  <span className="text-[var(--text-muted)]">ULTIMA_ATUALIZACAO:</span>
                  <span className="text-[var(--text-muted)]">
                    {new Date(policy.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Incidents Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-semibold text-xs uppercase tracking-wider">
              <AlertOctagon className="w-3.5 h-3.5" />
              <h4>{"// "}{t.historyDrawer.incidentHistory} [{incidents.length}]</h4>
            </div>

            {incidents.length === 0 ? (
              <div className="p-4 rounded-xs border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/40 text-center text-[var(--text-muted)] font-mono text-xs">
                <p>{t.historyDrawer.noIncidents}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3.5 rounded-xs border border-rose-500/30 bg-rose-500/5 space-y-2 font-mono text-[11px]"
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

                    <p className="text-[var(--text-primary)] text-[11px]">
                      {incident.metricObserved} • {incident.thresholdViolated}
                    </p>

                    <div className="p-2 rounded-xs border border-rose-500/30 bg-rose-500/10 text-rose-300 text-[10px]">
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
