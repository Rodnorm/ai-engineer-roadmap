"use client";

import React, { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle,
  Cpu,
  Gauge,
  GitBranch,
  Layers,
  Lock,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

interface AppInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppInfoDrawer({ isOpen, onClose }: AppInfoDrawerProps) {
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
      <div className="relative w-full max-w-xl h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl z-10 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[var(--sre-cyan)]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {"//"} {t.infoDrawer.title}
              </h3>
              <p className="text-[10px] font-mono text-[var(--text-muted)]">
                SPEC_SPECIFICATION :: SRE_RESILIENCE_AND_DEPLOYMENT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xs border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-6 text-xs text-[var(--text-primary)] leading-relaxed">
          {/* Section 1: Overview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--sre-cyan)] font-mono font-bold text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <h4>{"//"} 01 :: {t.infoDrawer.overviewTitle}</h4>
            </div>
            <p className="text-[var(--text-muted)] font-sans leading-relaxed">
              {t.infoDrawer.overviewContent}
            </p>
          </div>

          {/* Section 2: Traffic Routing */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
              <GitBranch className="w-3.5 h-3.5" />
              <h4>{"//"} 02 :: {t.infoDrawer.routingTitle}</h4>
            </div>
            <p className="text-[var(--text-muted)] font-sans leading-relaxed">
              {t.infoDrawer.routingContent}
            </p>
            <div className="p-3 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-[11px] space-y-1">
              <p className="text-[var(--sre-cyan)] font-bold">• BASELINE (BLUE): gpt-4o flagship</p>
              <p className="text-emerald-400 font-bold">• CANARY (GREEN): gpt-4o-mini / novo prompt</p>
              <p className="text-purple-400 font-bold">• SHADOW MIRROR: Invocação assíncrona duplicada</p>
            </div>
          </div>

          {/* Section 3: SLOs & Error Budgets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5" />
              <h4>{"//"} 03 :: {t.infoDrawer.sloTitle}</h4>
            </div>
            <p className="text-[var(--text-muted)] font-sans leading-relaxed">
              {t.infoDrawer.sloContent}
            </p>
            <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px]">
              <div className="p-2.5 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] uppercase">SLO Latência P95</span>
                <span className="font-bold text-[var(--sre-cyan)]">&lt; 2500ms</span>
              </div>
              <div className="p-2.5 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] uppercase">SLO Disponibilidade</span>
                <span className="font-bold text-emerald-400">99.0%</span>
              </div>
            </div>
          </div>

          {/* Section 4: Resilience & Circuit Breaker */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <h4>{"//"} 04 :: {t.infoDrawer.resilienceTitle}</h4>
            </div>
            <p className="text-[var(--text-muted)] font-sans leading-relaxed">
              {t.infoDrawer.resilienceContent}
            </p>
          </div>

          {/* Section 5: Governance & Security */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <h4>{"//"} 05 :: {t.infoDrawer.governanceTitle}</h4>
            </div>
            <p className="text-[var(--text-muted)] font-sans leading-relaxed">
              {t.infoDrawer.governanceContent}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/50 text-center text-[10px] text-[var(--text-muted)] font-mono">
          APP_08 :: SRE_RESILIENCE_AND_DEPLOYMENT_STUDIO :: CAPSTONE
        </div>
      </div>
    </div>
  );
}
