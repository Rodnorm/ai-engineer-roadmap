"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_LOCALE,
  Locale,
  LOCALE_HTML_LANG,
  LOCALE_STORAGE_KEY,
  detectBrowserLocale,
  isValidLocale,
} from "./locales";
import { getDictionary } from "./dictionaries";
import { Dictionary } from "./types";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: getDictionary(DEFAULT_LOCALE),
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const detected = detectBrowserLocale();
    setLocaleState(detected);
    setMounted(true);
    if (typeof document !== "undefined") {
      document.documentElement.lang = LOCALE_HTML_LANG[detected] || "en";
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (!isValidLocale(newLocale)) return;
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // Ignore storage error
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = LOCALE_HTML_LANG[newLocale] || "en";
    }
  };

  const t = getDictionary(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
