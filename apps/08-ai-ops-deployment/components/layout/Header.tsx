"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import {
  Activity,
  AlertOctagon,
  History,
  Info,
  Power,
  RotateCcw,
  Zap,
} from "lucide-react";

interface HeaderProps {
  mode: string;
  deployEnabled: boolean;
  onToggleKillSwitch: () => void;
  onOpenInfo: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  incidentCount: number;
}

export function Header({
  mode,
  deployEnabled,
  onToggleKillSwitch,
  onOpenInfo,
  onOpenHistory,
  onReset,
  incidentCount,
}: HeaderProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]/90 backdrop-blur-md px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xs bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[var(--sre-cyan)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-cyan-500/10 text-[var(--sre-cyan)] border border-cyan-500/30">
                APP 08
              </span>
              <h1 className="text-sm sm:text-base font-mono font-bold text-[var(--text-primary)] tracking-tight">
                {t.common.appTitle}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    mode === "online" ? "bg-emerald-400 animate-pulse" : "bg-[var(--sre-cyan)]"
                  }`}
                />
                {mode === "online" ? t.common.onlineMode : t.common.offlineMode}
              </span>
              <span>::</span>
              <span
                className={`font-semibold ${
                  deployEnabled ? "text-emerald-400" : "text-rose-400 animate-pulse"
                }`}
              >
                {deployEnabled ? t.common.killSwitchInactive : t.common.killSwitchActive}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Emergency Kill-Switch Toggle */}
          <button
            onClick={onToggleKillSwitch}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-xs text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              deployEnabled
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                : "bg-emerald-500 text-black border-emerald-400 font-bold shadow-sm"
            }`}
            title={deployEnabled ? t.common.emergencyStop : t.common.emergencyResume}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{deployEnabled ? t.common.emergencyStop : t.common.emergencyResume}</span>
          </button>

          {/* Reset Metrics */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xs text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--card-hover-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title={t.common.resetState}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.common.resetState}</span>
          </button>

          {/* Incident / History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 h-8 px-2.5 rounded-xs text-xs font-mono font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--card-hover-border)] text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{t.common.history}</span>
            {incidentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-xs text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                {incidentCount}
              </span>
            )}
          </button>

          {/* About App Drawer Trigger */}
          <button
            onClick={onOpenInfo}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xs text-xs font-mono font-medium border border-cyan-500/30 bg-cyan-500/10 text-[var(--sre-cyan)] hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{t.common.aboutApp}</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-0.5" />

          {/* Language Switcher & Theme */}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
