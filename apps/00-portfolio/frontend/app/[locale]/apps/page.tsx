import { CatalogPageView } from "@/components/views/CatalogPageView";
import { LOCALES, Locale, isValidLocale, getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return LOCALES.filter((l) => l !== "en").map((locale) => ({
    locale,
  }));
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return {
    title: `${dict.catalog.title} — ${dict.meta.siteTitle}`,
    description: dict.catalog.subtitle,
  };
}

export default function LocalizedAppsPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return <CatalogPageView locale={params.locale as Locale} />;
}
