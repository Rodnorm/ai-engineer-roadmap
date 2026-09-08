export const LOCALES = ["en", "pt", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "portfolio_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  de: "Deutsch",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  pt: "pt-BR",
  de: "de",
};

export function isValidLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Returns localized path for a given route and target locale.
 * English uses root routes ('/', '/apps', etc.), while 'pt' and 'de' are prefixed ('/pt', '/de/apps', etc.).
 */
export function getLocalizedPath(pathname: string, targetLocale: Locale): string {
  // Strip any existing locale prefix (/pt or /de)
  let cleanPath = pathname;
  for (const loc of LOCALES) {
    if (loc === "en") continue;
    if (cleanPath === `/${loc}`) {
      cleanPath = "/";
      break;
    } else if (cleanPath.startsWith(`/${loc}/`)) {
      cleanPath = cleanPath.slice(loc.length + 1);
      break;
    }
  }

  if (targetLocale === "en") {
    return cleanPath || "/";
  }

  return cleanPath === "/" ? `/${targetLocale}` : `/${targetLocale}${cleanPath}`;
}
