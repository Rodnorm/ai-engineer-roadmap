"use client";

import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT_LABELS, Locale } from "@/lib/i18n/locales";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-active)] transition-colors text-xs font-mono text-[var(--text-primary)] cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-[var(--sre-cyan)]" />
        <span>{LOCALE_SHORT_LABELS[locale]}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 rounded-xs border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl z-50 py-1 font-mono">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                locale === l
                  ? "bg-cyan-500/15 text-[var(--sre-cyan)] font-semibold border-l-2 border-l-[var(--sre-cyan)]"
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
              }`}
            >
              <span>{LOCALE_LABELS[l]}</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase">{l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
