import { MetadataRoute } from "next";
import { LOCALES, getRouteAlternates } from "@/lib/i18n";
import { getAppCatalog } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/experience",
    "/experience/ai-review-platform",
    "/apps",
    "/about",
    "/roadmap",
    "/datenschutz",
    "/impressum",
  ];

  // Dynamic app case study paths
  const apps = getAppCatalog();
  const appPaths = apps.map((app) => `/apps/${app.slug}`);

  const allPaths = [...staticPaths, ...appPaths];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of allPaths) {
    for (const locale of LOCALES) {
      const alternates = getRouteAlternates(path, locale);
      const isHome = path === "/";
      const isMainSection = path === "/experience" || path === "/apps" || path === "/about";

      entries.push({
        url: alternates.canonical,
        alternates: {
          languages: alternates.languages,
        },
        changeFrequency: isHome ? "weekly" : isMainSection ? "monthly" : "yearly",
        priority: isHome ? 1.0 : isMainSection ? 0.8 : 0.6,
      });
    }
  }

  return entries;
}
