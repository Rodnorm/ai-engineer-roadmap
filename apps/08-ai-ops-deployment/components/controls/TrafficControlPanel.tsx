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
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {t.trafficControl.title}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {t.trafficControl.subtitle}
            </p>
          </div>
        </div>

        {/* Mode Badge */}
        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase bg-[var(--bg-card)] border border-[var(--border-subtle)] text-blue-400">
          {policy.mode}
        </span>
      </div>

      {/* Active Rollback Alert Banner */}
      {policy.isRollbackActive && (
        <div className="mb-4 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-rose-300 text-xs">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{t.trafficControl.activeRollbackAlert}</p>
              {policy.rollbackReason && (
                <p className="text-[11px] text-rose-200/80 mt-0.5">
                  Motivo: {policy.rollbackReason}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClearRollback}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors whitespace-nowrap self-end sm:self-center"
          >
            Reconhecer & Restaurar
          </button>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <button
          onClick={() => handleModeChange("canary")}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            policy.mode === "canary"
              ? "bg-blue-600/15 border-blue-500/40 text-blue-400 font-semibold"
              : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>{t.trafficControl.modeCanary}</span>
        </button>

        <button
          onClick={() => handleModeChange("blue-green")}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            policy.mode === "blue-green"
              ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-400 font-semibold"
              : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{t.trafficControl.modeBlueGreen}</span>
        </button>

        <button
          onClick={() => handleModeChange("shadow-mirror")}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            policy.mode === "shadow-mirror"
              ? "bg-purple-600/15 border-purple-500/40 text-purple-400 font-semibold"
              : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t.trafficControl.modeShadow}</span>
        </button>

        <button
          onClick={() => handleModeChange("maintenance")}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            policy.mode === "maintenance"
              ? "bg-amber-600/15 border-amber-500/40 text-amber-400 font-semibold"
              : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t.trafficControl.modeMaintenance}</span>
        </button>
      </div>

      {/* Canary Traffic Split Slider & Version Cards */}
      <div className="space-y-4">
        {/* Version Indicators */}
        <div className="grid grid-cols-2 gap-3">
          {/* Blue Version Card */}
          <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">BLUE (Baseline)</span>
              <span className="text-sm font-mono font-bold text-blue-300">
                {policy.blueWeight}%
              </span>
            </div>
            <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1 truncate">
              {policy.blueModel}
            </p>
          </div>

          {/* Green Version Card */}
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">GREEN (Canary)</span>
              <span className="text-sm font-mono font-bold text-emerald-300">
                {policy.greenWeight}%
              </span>
            </div>
            <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1 truncate">
              {policy.greenModel}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-3 w-full bg-[var(--bg-card)] rounded-full overflow-hidden flex border border-[var(--border-subtle)]">
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
            style={{ width: `${policy.blueWeight}%` }}
          />
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${policy.greenWeight}%` }}
          />
        </div>

        {/* Slider Input */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] mb-1">
            <span>100% Blue</span>
            <span>50/50</span>
            <span>100% Green</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={policy.greenWeight}
            onChange={handleSliderChange}
            disabled={isUpdating || policy.isRollbackActive}
            className="w-full accent-emerald-500 cursor-pointer disabled:opacity-50"
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-5 pt-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onRevertBlue}
          disabled={isUpdating || policy.blueWeight === 100}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 disabled:opacity-40 transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{t.trafficControl.revertBlueTo100}</span>
        </button>

        <button
          onClick={onPromoteGreen}
          disabled={isUpdating || policy.greenWeight === 100}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.trafficControl.promoteGreenTo100}</span>
        </button>
      </div>
    </div>
  );
}
