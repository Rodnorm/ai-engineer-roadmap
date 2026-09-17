export const LOCALES = ["de", "pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";
export const LOCALE_COOKIE = "agent-workspace-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  "pt-BR": "Português",
  en: "English",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
