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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] transition-colors text-xs font-semibold text-[var(--text-primary)]"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-blue-400" />
        <span>{LOCALE_SHORT_LABELS[locale]}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl z-50 py-1">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between ${
                locale === l
                  ? "bg-blue-600/15 text-blue-400 font-semibold"
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
