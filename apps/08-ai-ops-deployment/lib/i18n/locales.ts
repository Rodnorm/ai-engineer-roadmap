export const LOCALES = ["en", "pt", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "app08_locale";
export const LOCALE_STORAGE_KEY = "app08_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  de: "Deutsch",
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
  de: "DE",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  pt: "pt-BR",
  de: "de",
};

export function isValidLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value as Locale);
}

/**
 * Detects the most appropriate locale based on user settings, browser language, or default.
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  // 1. Check saved user preference in localStorage
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isValidLocale(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }

  // 2. Inspect browser preferences
  const browserLanguages: readonly string[] =
    window.navigator.languages && window.navigator.languages.length > 0
      ? window.navigator.languages
      : [window.navigator.language || ""];

  for (const rawLang of browserLanguages) {
    if (!rawLang) continue;
    const lower = rawLang.toLowerCase();

    if (lower.startsWith("pt")) return "pt";
    if (lower.startsWith("de")) return "de";
    if (lower.startsWith("en")) return "en";
  }

  return DEFAULT_LOCALE;
}
