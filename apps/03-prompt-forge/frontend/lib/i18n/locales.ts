export const LOCALES = ["en", "pt-BR", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "prompt-forge-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  "pt-BR": "Português",
  de: "Deutsch",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
