"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Bot, HelpCircle, Network, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onOpenInfo?: () => void;
}

export function Header({ onOpenInfo }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-violet-600 text-white shadow-md shadow-violet-500/20">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              Multi-Agent Brief Generator
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-500 border border-violet-500/30">
              APP 07
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] hidden sm:block">
            Orquestração Heterogênea: Researcher (Tools) + Writer (Zero-Tool Synthesis)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Security / Mode badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-medium">Segurança & Rate Limit Ativos</span>
        </div>

        {/* Info Drawer Button */}
        <button
          type="button"
          onClick={onOpenInfo}
          aria-label="Sobre o App e Arquitetura Multi-Agente"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors"
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
