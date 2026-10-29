import { getRouteAlternates } from "./i18n";
import { getAppCatalog } from "./catalog";

export interface SitemapUrlEntry {
  url: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  alternates?: Record<string, string>;
}

export const SITEMAP_STATIC_PATHS = [
  "/",
  "/experience",
  "/experience/ai-review-platform",
  "/apps",
  "/about",
  "/roadmap",
  "/datenschutz",
  "/impressum",
] as const;

export function getSitemapEntries(): SitemapUrlEntry[] {
  const apps = getAppCatalog();
  const appPaths = apps.map((app) => `/apps/${app.slug}`);
  const allPaths = [...SITEMAP_STATIC_PATHS, ...appPaths];

  const entries: SitemapUrlEntry[] = [];

  for (const path of allPaths) {
    const alternates = getRouteAlternates(path, "en");
    const isHome = path === "/";
    const isMainSection = path === "/experience" || path === "/apps" || path === "/about";

    entries.push({
      url: alternates.canonical,
      alternates: alternates.languages,
      changefreq: isHome ? "weekly" : isMainSection ? "monthly" : "yearly",
      priority: isHome ? 1.0 : isMainSection ? 0.8 : 0.6,
    });
  }

  return entries;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export function generateSitemapXml(entries: SitemapUrlEntry[] = getSitemapEntries()): string {
  const urlsXml = entries
    .map((entry) => {
      const alternateTags = entry.alternates
        ? Object.entries(entry.alternates)
            .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`)
            .join("\n")
        : "";

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        alternateTags,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority.toFixed(1)}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlsXml,
    "</urlset>",
    "",
  ].join("\n");
}
