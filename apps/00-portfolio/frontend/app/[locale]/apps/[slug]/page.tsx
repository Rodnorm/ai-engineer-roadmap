import { getAppCatalog, getAppBySlug } from "@/lib/catalog";
import { CaseStudyPageView } from "@/components/views/CaseStudyPageView";
import { LOCALES, Locale, isValidLocale, getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  const locales = LOCALES.filter((l) => l !== "en");
  const apps = getAppCatalog("en");

  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const app of apps) {
      params.push({
        locale,
        slug: app.slug,
      });
    }
  }

  return params;
}

export function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  if (!isValidLocale(params.locale)) return {};
  const app = getAppBySlug(params.slug, params.locale as Locale);
  if (!app) return {};
  const dict = getDictionary(params.locale);

  return {
    title: `${app.title} — ${dict.meta.siteTitle}`,
    description: app.summary,
  };
}

export default function LocalizedCaseStudyPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const app = getAppBySlug(params.slug, params.locale as Locale);
  if (!app) {
    notFound();
  }

  return <CaseStudyPageView slug={params.slug} locale={params.locale as Locale} />;
}
