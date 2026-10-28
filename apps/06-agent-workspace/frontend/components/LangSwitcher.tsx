"use client";

import React, { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, LOCALES, Locale } from "@/lib/i18n/locales";

export function LangSwitcher() {
  const { locale, setLocale } = useI18n();
  const t = useT("controls");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
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
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
        className="control-button gap-1.5 px-2 text-xs font-mono cursor-pointer"
      >
        <Globe className="size-3.5 text-accent shrink-0" />
        <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        <span className="uppercase sm:hidden">{locale}</span>
        <ChevronDown className={`size-3 transition-transform text-muted shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 top-full z-50 mt-1 min-w-36 overflow-hidden rounded-xs border border-border bg-panel py-1 font-mono text-xs shadow-xl"
        >
          {LOCALES.map((option) => (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option === locale}
                onClick={() => selectLocale(option)}
                className={`w-full cursor-pointer px-3 py-1.5 text-left text-xs transition focus:outline-none ${
                  option === locale
                    ? "bg-surface font-semibold text-accent-bright"
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
