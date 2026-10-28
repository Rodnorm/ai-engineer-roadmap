"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locales";

const SHORT_LOCALE_LABELS: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  "pt-BR": "PT",
};

export default function LangSwitcher() {
  const { locale, setLocale } = useI18n();
  const t = useT("controls");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative font-mono">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
        className="inline-flex h-8 items-center gap-1.5 border border-border bg-panel px-2.5 text-xs text-terminal hover:border-border-focus hover:bg-surface hover:text-text focus:outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
      >
        <span className="font-bold text-accent">{SHORT_LOCALE_LABELS[locale]}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 z-50 mt-1 min-w-32 overflow-hidden border border-border bg-panel py-1 shadow-lg text-xs"
        >
          {LOCALES.map((option) => (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option === locale}
                onClick={() => selectLocale(option)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-xs transition cursor-pointer focus:outline-none ${
                  option === locale
                    ? "bg-surface font-bold text-accent"
                    : "text-text hover:bg-surface/50"
                }`}
              >
                <span>{SHORT_LOCALE_LABELS[option]}</span>
                <span className="text-[10px] text-muted">{LOCALE_LABELS[option]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}
