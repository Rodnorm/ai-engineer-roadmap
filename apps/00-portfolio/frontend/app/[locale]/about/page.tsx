import { AboutPageView } from "@/components/views/AboutPageView";
import { LOCALES, Locale, isValidLocale, getDictionary, createPageMetadata } from "@/lib/i18n";
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

  return createPageMetadata({
    title: `${dict.about.badge} — ${dict.about.title}`,
    description: dict.about.bio,
    pathname: "/about",
    locale: locale as Locale,
  });
}

export default async function LocalizedAboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <AboutPageView locale={locale as Locale} />;
}
