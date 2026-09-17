"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import de from "./dictionaries/de.json";
import ptBR from "./dictionaries/pt-BR.json";
import en from "./dictionaries/en.json";
import { DEFAULT_LOCALE, LOCALE_COOKIE, Locale } from "./locales";

const dictionaries = {
  de,
  "pt-BR": ptBR,
  en,
} as const;

export type Dictionary = typeof de;

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_COOKIE) as Locale;
    if (saved && (saved === "de" || saved === "pt-BR" || saved === "en")) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = DEFAULT_LOCALE;
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    localStorage.setItem(LOCALE_COOKIE, nextLocale);
  }, []);

  const value = useMemo(
    () => ({ locale, dict: dictionaries[locale] || dictionaries.de, setLocale }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider.");
  return context;
}

export function useT<K extends keyof Dictionary>(namespace: K) {
  const { dict } = useI18n();

  return useCallback(
    (key: keyof Dictionary[K], values?: Record<string, string | number>): string => {
      const raw = (dict[namespace] as Record<string, string>)[key as string];
      if (typeof raw !== "string") return String(key);
      if (!values) return raw;

      return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
        values[name] === undefined ? `{${name}}` : String(values[name])
      );
    },
    [dict, namespace]
  );
}
