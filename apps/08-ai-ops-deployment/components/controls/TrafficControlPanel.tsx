"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { RoutingMode, TrafficPolicy } from "@/types/deployment";
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  GitBranch,
  Layers,
  ShieldAlert,
  Sliders,
  Zap,
} from "lucide-react";

interface TrafficControlPanelProps {
  policy: TrafficPolicy;
  onUpdatePolicy: (policy: Partial<TrafficPolicy>) => void;
  onPromoteGreen: () => void;
  onRevertBlue: () => void;
  onClearRollback: () => void;
  isUpdating?: boolean;
}

export function TrafficControlPanel({
  policy,
  onUpdatePolicy,
  onPromoteGreen,
  onRevertBlue,
  onClearRollback,
  isUpdating = false,
}: TrafficControlPanelProps) {
  const { t } = useI18n();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const greenWeight = parseInt(e.target.value, 10);
    const blueWeight = 100 - greenWeight;
    onUpdatePolicy({
      mode: "canary",
      blueWeight,
      greenWeight,
    });
  };

  const handleModeChange = (mode: RoutingMode) => {
    if (mode === "blue-green") {
      onUpdatePolicy({ mode, blueWeight: 0, greenWeight: 100 });
    } else if (mode === "shadow-mirror") {
      onUpdatePolicy({ mode, blueWeight: 100, greenWeight: 0 });
    } else {
      onUpdatePolicy({ mode });
    }
  };

  return (
    <div className="rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xs bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[var(--sre-cyan)]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {"//"} {t.trafficControl.title}
            </h2>
            <p className="text-[11px] font-sans text-[var(--text-muted)]">
              {t.trafficControl.subtitle}
            </p>
          </div>
        </div>

        {/* Mode Badge */}
        <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--sre-cyan)]">
          POLICY: {policy.mode}
        </span>
      </div>

      {/* Active Rollback Alert Banner */}
      {policy.isRollbackActive && (
        <div className="mb-4 p-3 rounded-xs border border-rose-500/30 bg-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-start gap-2.5 text-rose-300 text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{"//"} {t.trafficControl.activeRollbackAlert}</p>
              {policy.rollbackReason && (
                <p className="text-[10px] text-rose-200/80 mt-0.5 font-sans">
                  Motivo: {policy.rollbackReason}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClearRollback}
            className="px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors whitespace-nowrap self-end sm:self-center cursor-pointer"
          >
            [ Reconhecer & Restaurar ]
          </button>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4">
        <button
          onClick={() => handleModeChange("canary")}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xs text-xs font-mono font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
            policy.mode === "canary"
              ? "bg-cyan-500/15 border-cyan-500/50 text-[var(--sre-cyan)] font-bold shadow-sm"
              : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>{t.trafficControl.modeCanary}</span>
        </button>

        <button
          onClick={() => handleModeChange("blue-green")}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xs text-xs font-mono font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
            policy.mode === "blue-green"
              ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold shadow-sm"
              : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{t.trafficControl.modeBlueGreen}</span>
        </button>

        <button
          onClick={() => handleModeChange("shadow-mirror")}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xs text-xs font-mono font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
            policy.mode === "shadow-mirror"
              ? "bg-purple-500/15 border-purple-500/50 text-purple-400 font-bold shadow-sm"
              : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t.trafficControl.modeShadow}</span>
        </button>

        <button
          onClick={() => handleModeChange("maintenance")}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xs text-xs font-mono font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
            policy.mode === "maintenance"
              ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-bold shadow-sm"
              : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--card-hover-border)]"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t.trafficControl.modeMaintenance}</span>
        </button>
      </div>

      {/* Canary Traffic Split Slider & Version Cards */}
      <div className="space-y-3 font-mono">
        {/* Version Indicators */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Blue Version Card */}
          <div className="p-3 rounded-xs border border-cyan-500/30 bg-cyan-500/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--sre-cyan)] uppercase tracking-wider">BLUE :: BASELINE</span>
              <span className="text-sm font-mono font-bold text-[var(--sre-cyan)]">
                {policy.blueWeight}%
              </span>
            </div>
            <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1 truncate">
              {policy.blueModel}
            </p>
          </div>

          {/* Green Version Card */}
          <div className="p-3 rounded-xs border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">GREEN :: CANARY</span>
              <span className="text-sm font-mono font-bold text-emerald-300">
                {policy.greenWeight}%
              </span>
            </div>
            <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1 truncate">
              {policy.greenModel}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2 w-full bg-[var(--bg-card)] rounded-xs overflow-hidden flex border border-[var(--border-subtle)]">
          <div
            className="bg-[var(--sre-cyan)] transition-all duration-300"
            style={{ width: `${policy.blueWeight}%` }}
          />
          <div
            className="bg-emerald-400 transition-all duration-300"
            style={{ width: `${policy.greenWeight}%` }}
          />
        </div>

        {/* Slider Input */}
        <div>
          <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] mb-1 uppercase">
            <span>[100% BLUE]</span>
            <span>[50 / 50]</span>
            <span>[100% GREEN]</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={policy.greenWeight}
            onChange={handleSliderChange}
            disabled={isUpdating || policy.isRollbackActive}
            className="w-full accent-emerald-400 cursor-pointer disabled:opacity-50"
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3.5 border-t border-[var(--border-subtle)]">
        <button
          onClick={onRevertBlue}
          disabled={isUpdating || policy.blueWeight === 100}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold uppercase tracking-wider border border-cyan-500/30 bg-cyan-500/10 text-[var(--sre-cyan)] hover:bg-cyan-500/20 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>{t.trafficControl.revertBlueTo100}</span>
        </button>

        <button
          onClick={onPromoteGreen}
          disabled={isUpdating || policy.greenWeight === 100}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>{t.trafficControl.promoteGreenTo100}</span>
        </button>
      </div>
    </div>
  );
}
