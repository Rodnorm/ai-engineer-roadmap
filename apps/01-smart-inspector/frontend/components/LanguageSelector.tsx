"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  LOCALES,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n";
import { Globe } from "lucide-react";

/**
 * Top-right language switcher. Renders a button that toggles a dropdown
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
        className="inline-flex h-8 items-center gap-2 border border-border bg-surface px-2.5 font-mono text-xs font-medium text-text transition hover:border-border-active hover:bg-surface-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <Globe className="size-3.5 text-accent" />
        <span className="uppercase">{LOCALE_LABELS[locale]}</span>
        <span aria-hidden="true" className="text-[10px] text-muted">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("lang.menuLabel")}
          className="absolute right-0 z-30 mt-1 min-w-[9rem] border border-border bg-panel shadow-2xl font-mono text-xs"
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
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition ${
                    selected
                      ? "bg-accent/15 text-accent font-semibold"
                      : "text-text hover:bg-surface"
                  }`}
                >
                  <span>{LOCALE_LABELS[option]}</span>
                  {selected && (
                    <span aria-hidden="true" className="text-accent text-xs">✓</span>
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
