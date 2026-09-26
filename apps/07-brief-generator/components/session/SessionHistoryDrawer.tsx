"use client";

import React, { useEffect, useState } from "react";
import { StoredBrief } from "@/lib/session/brief-repository";
import {
  Clock,
  Database,
  FileText,
  History,
  Lock,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

interface SessionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBrief: (brief: StoredBrief) => void;
  currentBriefId?: string;
}

export function SessionHistoryDrawer({
  isOpen,
  onClose,
  onSelectBrief,
  currentBriefId,
}: SessionHistoryDrawerProps) {
  const { t, locale } = useI18n();
  const [briefs, setBriefs] = useState<StoredBrief[]>([]);
  const [sessionInfo, setSessionInfo] = useState<{
    shortId: string;
    privacyNotice: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessionAndBriefs = async () => {
    setIsLoading(true);
    try {
      const [sessionRes, briefsRes] = await Promise.all([
        fetch("/api/session"),
        fetch("/api/briefs"),
      ]);

      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setSessionInfo(sData);
      }

      if (briefsRes.ok) {
        const bData = await briefsRes.json();
        setBriefs(bData.briefs || []);
      }
    } catch (err) {
      console.warn("Falha ao carregar dados da sessão:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessionAndBriefs();
    }
  }, [isOpen]);

  const handleClearHistory = async () => {
    const confirmMsg =
      locale === "de"
        ? "Möchten Sie den Briefing-Verlauf dieser Sitzung wirklich löschen?"
        : locale === "en"
        ? "Are you sure you want to clear your session history?"
        : "Deseja realmente limpar o histórico de briefings desta sessão?";

    if (!confirm(confirmMsg)) {
      return;
    }
    try {
      await fetch("/api/briefs", { method: "DELETE" });
      setBriefs([]);
    } catch {
      // ignore
    }
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/briefs?id=${id}`, { method: "DELETE" });
      setBriefs((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const dateLocale = locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "pt-BR";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t.historyDrawer.title}
                </h3>
                {sessionInfo && (
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {sessionInfo.shortId}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Banner */}
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] flex items-start gap-2 text-emerald-500">
            <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              {t.historyDrawer.privacyNotice}
            </span>
          </div>

          {/* Briefs List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2 text-xs text-[var(--text-muted)]">
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : briefs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2 text-xs text-[var(--text-muted)] text-center">
                <FileText className="w-8 h-8 opacity-30" />
                <p className="font-semibold">{t.historyDrawer.emptyTitle}</p>
                <p className="text-[11px]">{t.historyDrawer.emptySubtitle}</p>
              </div>
            ) : (
              briefs.map((b) => {
                const isSelected = currentBriefId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBrief(b);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-[var(--accent-agent-writer)] bg-violet-500/10 shadow-sm"
                        : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--card-hover-border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-[var(--text-primary)] line-clamp-1">
                        {b.result.brief.title || b.topic}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOne(b.id, e)}
                        title="Delete"
                        className="text-[var(--text-muted)] hover:text-red-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                      {b.topic}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]/50 text-[10px] text-[var(--text-muted)] font-mono">
                      <span>{new Date(b.createdAt).toLocaleTimeString(dateLocale)}</span>
                      <span className="capitalize">{b.tone} • {b.result.metrics.totalLatencyMs}ms</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Clear All */}
          {briefs.length > 0 && (
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/40 flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)]">
                {briefs.length} {briefs.length === 1 ? "briefing" : "briefings"}
              </span>
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
              >
                {t.historyDrawer.clearSessionBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
