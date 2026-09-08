import { AboutPageView } from "@/components/views/AboutPageView";
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
    title: `${dict.about.badge} — ${dict.about.title}`,
    description: dict.about.bio,
  };
}

export default function LocalizedAboutPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return <AboutPageView locale={params.locale as Locale} />;
}
