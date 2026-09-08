import "server-only";

import de from "./dictionaries/de.json";
import en from "./dictionaries/en.json";
import ptBR from "./dictionaries/pt-BR.json";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

const dictionaries = {
  de,
  en,
  "pt-BR": ptBR,
} as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
