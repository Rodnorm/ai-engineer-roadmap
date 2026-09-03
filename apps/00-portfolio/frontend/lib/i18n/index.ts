import { DEFAULT_LOCALE, Locale, isValidLocale } from "./locales";
import { en, Dictionary } from "./dictionaries/en";
import { pt } from "./dictionaries/pt";
import { de } from "./dictionaries/de";

const dictionaries: Record<Locale, Dictionary> = {
  en,
  pt,
  de,
};

export function getDictionary(locale?: string | null): Dictionary {
  if (isValidLocale(locale)) {
    return dictionaries[locale];
  }
  return dictionaries[DEFAULT_LOCALE];
}

export * from "./locales";
export type { Dictionary };
