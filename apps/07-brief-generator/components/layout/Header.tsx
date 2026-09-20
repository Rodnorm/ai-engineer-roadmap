"use client";

import React, { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  HelpCircle,
  History,
  Lock,
  Network,
  ShieldCheck,
} from "lucide-react";

interface HeaderProps {
  onOpenInfo?: () => void;
  onOpenHistory?: () => void;
  briefsCount?: number;
}

export function Header({
  onOpenInfo,
  onOpenHistory,
  briefsCount = 0,
}: HeaderProps) {
  const [sessionShortId, setSessionShortId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.shortId) setSessionShortId(data.shortId);
      })
      .catch(() => {});
  }, [briefsCount]);

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-violet-600 text-white shadow-md shadow-violet-500/20">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)]">
              Multi-Agent Brief Generator
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-500 border border-violet-500/30">
              APP 07
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
            Orquestração Heterogênea: Researcher (Tools) + Writer (Zero-Tool Synthesis)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Session Badge */}
        {sessionShortId && (
          <button
            type="button"
            onClick={onOpenHistory}
            title="Sessão Privada isolada via cookie assinado. Clique para ver histórico."
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500/15 transition-colors cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>{sessionShortId}</span>
            {briefsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20">
                {briefsCount}
              </span>
            )}
          </button>
        )}

        {/* History Button */}
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Abrir histórico de briefings da sessão"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Histórico</span>
        </button>

        {/* Info Drawer Button */}
        <button
          type="button"
          onClick={onOpenInfo}
          aria-label="Sobre o App e Arquitetura Multi-Agente"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sobre o App</span>
        </button>

        {/* Dark / Light Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
