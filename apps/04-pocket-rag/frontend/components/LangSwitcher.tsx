"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locales";

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
        className="control-button gap-2 px-3"
      >
        <LanguageIcon />
        <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 z-50 mt-2 min-w-36 overflow-hidden rounded-xl border border-border bg-panel py-1 shadow-xl"
        >
          {LOCALES.map((option) => (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option === locale}
                onClick={() => selectLocale(option)}
                className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:bg-accent-soft ${
                  option === locale
                    ? "bg-accent-soft font-medium text-accent-strong"
                    : "text-text hover:bg-surface"
                }`}
              >
                {LOCALE_LABELS[option]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`size-3 transition ${open ? "rotate-180" : ""}`} aria-hidden="true">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}
