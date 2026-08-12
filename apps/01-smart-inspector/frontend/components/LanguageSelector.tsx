"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  LOCALES,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n";

/**
 * Top-left language switcher. Renders a button that toggles a dropdown
 * listing the three supported locales (pt-BR, en, de). The current locale
 * is highlighted and selecting another updates the global language.
 */
export default function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.menuLabel")}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition hover:bg-bg"
      >
        <span aria-hidden="true" className="text-base">🌐</span>
        <span>{LOCALE_LABELS[locale]}</span>
        <span aria-hidden="true" className="text-xs text-muted">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("lang.menuLabel")}
          className="absolute left-0 z-20 mt-2 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        >
          {LOCALES.map((option) => {
            const selected = option === locale;
            return (
              <li key={option} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                    selected
                      ? "bg-accent/15 text-text"
                      : "text-text hover:bg-bg"
                  }`}
                >
                  <span>{LOCALE_LABELS[option]}</span>
                  {selected && (
                    <span aria-hidden="true" className="text-accent">✓</span>
                  )}
                  <span className="sr-only">
                    {t("lang.changeTo", { language: LOCALE_LABELS[option] })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
