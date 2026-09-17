import { CatalogPageView } from "@/components/views/CatalogPageView";
import { LOCALES, Locale, isValidLocale, getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return LOCALES.filter((l) => l !== "en").map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: `${dict.catalog.title} — ${dict.meta.siteTitle}`,
    description: dict.catalog.subtitle,
  };
}

export default async function LocalizedAppsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <CatalogPageView locale={locale as Locale} />;
}
