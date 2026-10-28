"use client";

import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
} from "@/lib/i18n/locales";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.header.switchLanguage}
        title={t.header.switchLanguage}
        className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-xs text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--dossier-accent)] transition-colors cursor-pointer"
      >
        <Globe className="size-3.5 text-accent-research" />
        <span className="font-bold">{LOCALE_SHORT_LABELS[locale]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs shadow-xl z-50 font-mono">
          {LOCALES.map((loc) => {
            const isSelected = loc === locale;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[var(--bg-card)] text-[var(--dossier-accent)] font-bold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
              >
                <span>{LOCALE_LABELS[loc]}</span>
                <span className="text-[10px] uppercase text-[var(--text-muted)]">
                  {loc}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
