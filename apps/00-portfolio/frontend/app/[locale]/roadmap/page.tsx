import { RoadmapPageView } from "@/components/views/RoadmapPageView";
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
    title: `${dict.roadmap.title} — ${dict.meta.siteTitle}`,
    description: dict.roadmap.subtitle,
  };
}

export default function LocalizedRoadmapPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return <RoadmapPageView locale={params.locale as Locale} />;
}
