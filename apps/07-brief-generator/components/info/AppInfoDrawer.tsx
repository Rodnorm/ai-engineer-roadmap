"use client";

import React, { useEffect } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle,
  Cpu,
  Feather,
  FileText,
  Lock,
  Search,
  Shield,
  X,
  Zap,
} from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

interface AppInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppInfoDrawer({ isOpen, onClose }: AppInfoDrawerProps) {
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xs bg-[var(--dossier-accent)]/15 border border-[var(--dossier-accent)]/40 flex items-center justify-center text-[var(--dossier-accent)]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {"//"} {t.appInfo.title}
                </h3>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  SPEC_SPECIFICATION :: MULTI_AGENT_DOSSIER_SYSTEM
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-xs border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed">
            {/* 1. O Conceito Multi-Agente */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 text-[var(--dossier-accent)] font-mono font-bold uppercase tracking-wider text-[11px]">
                <Bot className="w-3.5 h-3.5" />
                <h4>{"//"} 01 :: {t.appInfo.section1Title}</h4>
              </div>
              <p className="text-[var(--text-muted)] font-sans">
                {t.appInfo.section1Text}
              </p>
              <div className="p-3 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2 font-mono text-[11px]">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-[var(--text-primary)]">{t.appInfo.section1Point1Title}</strong> — {t.appInfo.section1Point1Text}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-[var(--text-primary)]">{t.appInfo.section1Point2Title}</strong> — {t.appInfo.section1Point2Text}</span>
                </div>
              </div>
            </section>

            {/* 2. Os Agentes Especializados */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--dossier-accent)] font-mono font-bold uppercase tracking-wider text-[11px]">
                <Cpu className="w-3.5 h-3.5" />
                <h4>{"//"} 02 :: {t.appInfo.section2Title}</h4>
              </div>

              {/* Researcher Card */}
              <div className="p-3 rounded-xs border border-sky-500/30 bg-sky-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Search className="w-3 h-3" /> [AGENT 01: RESEARCHER]
                  </span>
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    TOOL_CALLING
                  </span>
                </div>
                <p className="text-[var(--text-muted)] font-sans text-xs">
                  {t.appInfo.section2ResearcherDesc}
                </p>
              </div>

              {/* Writer Card */}
              <div className="p-3 rounded-xs border border-yellow-500/30 bg-yellow-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-yellow-500 flex items-center gap-1.5 uppercase tracking-wider">
                    <Feather className="w-3 h-3" /> [AGENT 02: WRITER]
                  </span>
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                    SYNTHESIS_ENGINE
                  </span>
                </div>
                <p className="text-[var(--text-muted)] font-sans text-xs">
                  {t.appInfo.section2WriterDesc}
                </p>
              </div>
            </section>

            {/* 3. Topologia e Protocolo de Handoff */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                <Activity className="w-3.5 h-3.5" />
                <h4>{"//"} 03 :: TOPOLOGIA DO HANDOFF TRACE</h4>
              </div>
              <div className="p-3 rounded-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-[11px] space-y-2">
                <div className="flex items-center gap-2 text-sky-400">
                  <span className="font-bold">[1. RESEARCHER]</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <span className="text-[var(--text-muted)] font-sans">Levanta fatos, métricas e citações primárias</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-400">
                  <span className="font-bold">[2. HANDOFF]</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <span className="text-[var(--text-muted)] font-sans">Validação Zod do Schema do Dossiê Estruturado</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <span className="font-bold">[3. WRITER]</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <span className="text-[var(--text-muted)] font-sans">Redação final e recomendações executivas</span>
                </div>
              </div>
            </section>

            {/* 4. Segurança, Concorrência e Sessão */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <h4>{"//"} 04 :: {t.appInfo.section3Title}</h4>
              </div>
              <ul className="space-y-2 text-[var(--text-muted)] font-sans">
                <li className="flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-[var(--text-primary)]">{t.appInfo.section3PrivacyTitle}:</strong> {t.appInfo.section3PrivacyDesc}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-[var(--text-primary)]">{t.appInfo.section3RateLimitTitle}:</strong> {t.appInfo.section3RateLimitDesc}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-[var(--text-primary)]">{t.appInfo.section3KillSwitchTitle}:</strong> {t.appInfo.section3KillSwitchDesc}</span>
                </li>
              </ul>
            </section>

            {/* 5. Telemetria */}
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--dossier-accent)] font-mono font-bold uppercase tracking-wider text-[11px]">
                <Activity className="w-3.5 h-3.5" />
                <h4>{"//"} 05 :: {t.appInfo.section4Title}</h4>
              </div>
              <p className="text-[var(--text-muted)] font-sans">
                {t.appInfo.section4Text}
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/50 text-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xs text-xs font-mono font-bold uppercase tracking-wider bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--dossier-accent)] transition-colors cursor-pointer"
            >
              [ {t.header.aboutBtn} ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
