"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Dictionary } from "./getDictionary";
import { LOCALE_COOKIE, type Locale } from "./locales";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  dictionaries,
  children,
}: {
  initialLocale: Locale;
  dictionaries: Record<Locale, Dictionary>;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;

      setLocaleState(nextLocale);
      document.documentElement.lang = nextLocale;
      document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem(LOCALE_COOKIE, nextLocale);
      router.refresh();
    },
    [locale, router],
  );

  const value = useMemo(
    () => ({ locale, dict: dictionaries[locale], setLocale }),
    [dictionaries, locale, setLocale],
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
        values[name] === undefined ? `{${name}}` : String(values[name]),
      );
    },
    [dict, namespace],
  );
}
