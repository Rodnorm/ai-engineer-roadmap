import { getAppCatalog, getAppBySlug } from "@/lib/catalog";
import { CaseStudyPageView } from "@/components/views/CaseStudyPageView";
import { LOCALES, Locale, isValidLocale, getDictionary, createPageMetadata } from "@/lib/i18n";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

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

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const validLoc = locale as Locale;
  const app = getAppBySlug(slug, validLoc);
  if (!app) return {};
  const dict = getDictionary(validLoc);

  return createPageMetadata({
    title: `${app.title} — ${dict.meta.siteTitle}`,
    description: app.summary,
    pathname: `/apps/${slug}`,
    locale: validLoc,
  });
}

export default async function LocalizedCaseStudyPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const app = getAppBySlug(slug, locale as Locale);
  if (!app) {
    notFound();
  }

  return <CaseStudyPageView slug={slug} locale={locale as Locale} />;
}
