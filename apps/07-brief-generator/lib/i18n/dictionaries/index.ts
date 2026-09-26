import { DEFAULT_LOCALE, Locale, isValidLocale } from "../locales";
import { Dictionary } from "../types";
import { en } from "./en";
import { pt } from "./pt";
import { de } from "./de";

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

export * from "../types";
