import { LOCALES, Locale, LOCALE_HTML_LANG, getLocalizedPath } from "./locales";

export const SITE_URL = "https://normando.dev";

export interface PageAlternates {
  canonical: string;
  languages: Record<string, string>;
}

/**
 * Returns canonical URL and reciprocal hreflang alternates (including x-default).
 * Single source of truth for both metadata generation and sitemap.xml.
 */
export function getRouteAlternates(pathname: string, currentLocale: Locale): PageAlternates {
  const canonicalPath = getLocalizedPath(pathname, currentLocale);
  const canonical = `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;

  const languages: Record<string, string> = {};

  for (const loc of LOCALES) {
    const locPath = getLocalizedPath(pathname, loc);
    const langKey = LOCALE_HTML_LANG[loc] || loc;
    languages[langKey] = `${SITE_URL}${locPath === "/" ? "" : locPath}`;
  }

  // x-default points to English (international default)
  const defaultPath = getLocalizedPath(pathname, "en");
  languages["x-default"] = `${SITE_URL}${defaultPath === "/" ? "" : defaultPath}`;

  return {
    canonical,
    languages,
  };
}
