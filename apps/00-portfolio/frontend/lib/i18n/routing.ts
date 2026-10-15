import type { Metadata } from "next";
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

export interface CreatePageMetadataOptions {
  title: string;
  description: string;
  pathname: string;
  locale: Locale;
  image?: string;
}

/**
 * Builds localized page metadata ensuring Open Graph and Twitter tags
 * match the specific page title, description, and canonical URL.
 */
export function createPageMetadata({
  title,
  description,
  pathname,
  locale,
  image = "/images/editorial/og-card.png",
}: CreatePageMetadataOptions): Metadata {
  const alternates = getRouteAlternates(pathname, locale);
  const ogLocale = locale === "pt" ? "pt_BR" : locale === "de" ? "de_DE" : "en_US";

  return {
    title,
    description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "Rodrigo Normando",
      locale: ogLocale,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
