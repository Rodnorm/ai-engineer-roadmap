import { Locale } from "../locales";
import { Dictionary } from "../types";
import { enDictionary } from "./en";
import { ptDictionary } from "./pt";
import { deDictionary } from "./de";

const dictionaries: Record<Locale, Dictionary> = {
  en: enDictionary,
  pt: ptDictionary,
  de: deDictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
