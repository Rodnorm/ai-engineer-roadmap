import "server-only";
import type { Locale } from "./locales";
import { isLocale } from "./locales";

import de from "./messages/de.json";
import en from "./messages/en.json";
import ptBR from "./messages/pt-BR.json";

const dictionaries = {
	de,
	en,
	"pt-BR": ptBR,
} as const;

export type Dictionary = typeof de;

export function getDictionary(locale: Locale): Dictionary {
	return dictionaries[locale];
}

export function resolveLocale(value: string | undefined | null): Locale {
	return isLocale(value) ? value : "de";
}
