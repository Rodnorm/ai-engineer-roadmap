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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                APP 08
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                {t.common.appTitle}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
              <span className="inline-flex items-center gap-1 font-mono">
                <span
                  className={`w-2 h-2 rounded-full ${
                    mode === "online" ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
                  }`}
                />
                {mode === "online" ? t.common.onlineMode : t.common.offlineMode}
              </span>
              <span>•</span>
              <span
                className={`font-mono font-semibold ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              deployEnabled
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                : "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
            }`}
            title={deployEnabled ? t.common.emergencyStop : t.common.emergencyResume}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{deployEnabled ? t.common.emergencyStop : t.common.emergencyResume}</span>
          </button>

          {/* Reset Metrics */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title={t.common.resetState}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.common.resetState}</span>
          </button>

          {/* Incident / History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] transition-colors"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{t.common.history}</span>
            {incidentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                {incidentCount}
              </span>
            )}
          </button>

          {/* About App Drawer Trigger */}
          <button
            onClick={onOpenInfo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{t.common.aboutApp}</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-1" />

          {/* Language Switcher & Theme */}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
