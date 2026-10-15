import { RoadmapPageView } from "@/components/views/RoadmapPageView";
import { LOCALES, Locale, isValidLocale, getDictionary, getRouteAlternates } from "@/lib/i18n";
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
  const validLoc = locale as Locale;
  const dict = getDictionary(validLoc);
  const alternates = getRouteAlternates("/roadmap", validLoc);

  return {
    title: `${dict.roadmap.title} — ${dict.meta.siteTitle}`,
    description: dict.roadmap.subtitle,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function LocalizedRoadmapPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <RoadmapPageView locale={locale as Locale} />;
}
