"use client";

import React, { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import {
  HelpCircle,
  History,
  Lock,
  Network,
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
  const { t } = useI18n();
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
    <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-xs border border-[var(--dossier-accent)] bg-[var(--dossier-accent)]/15 text-[var(--dossier-accent)]">
          <Network className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[var(--dossier-accent)]">{"//"} DOSSIER_PIPELINE</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-[var(--text-primary)]">
              {t.header.title}
            </h1>
            <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-bold bg-[var(--dossier-accent)]/15 text-[var(--dossier-accent)] border border-[var(--dossier-accent)]/30">
              {t.header.badge}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Session Badge */}
        {sessionShortId && (
          <button
            type="button"
            onClick={onOpenHistory}
            title={t.header.sessionTitle}
            className="hidden md:flex items-center gap-1.5 px-2.5 h-8 rounded-xs text-xs font-mono bg-[var(--bg-card)] text-emerald-400 border border-[var(--border-subtle)] hover:border-emerald-500/50 transition-colors cursor-pointer"
          >
            <Lock className="size-3" />
            <span>#{sessionShortId}</span>
            {briefsCount > 0 && (
              <span className="ml-0.5 px-1 py-0.2 rounded-xs text-[9px] bg-emerald-500/20">
                {briefsCount}
              </span>
            )}
          </button>
        )}

        {/* History Button */}
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label={t.header.historyBtn}
          className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-xs text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--dossier-accent)] transition-colors cursor-pointer"
        >
          <History className="size-3.5" />
          <span className="hidden sm:inline">[ {t.header.historyBtn} ]</span>
        </button>

        {/* Info Drawer Button */}
        <button
          type="button"
          onClick={onOpenInfo}
          aria-label={t.header.aboutBtn}
          className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-xs text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--dossier-accent)] transition-colors cursor-pointer"
        >
          <HelpCircle className="size-3.5" />
          <span className="hidden sm:inline">[ {t.header.aboutBtn} ]</span>
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Dark / Light Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
