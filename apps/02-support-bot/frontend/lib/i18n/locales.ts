/**
 * Supported locales and their metadata.
 *
 * Order in `LOCALES` matches the order shown in the language switcher.
 */
export const LOCALES = ["de", "en", "pt-BR"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";

export const LOCALE_COOKIE = "locale";

/** Human-readable labels rendered inside the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
	de: "Deutsch",
	en: "English",
	"pt-BR": "Português",
};

export function isLocale(value: string | undefined | null): value is Locale {
	return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
