import { notFound } from "next/navigation";
import { ProfessionalCasePageView } from "@/components/views/ProfessionalCasePageView";
import { LOCALES, Locale, isValidLocale, getRouteAlternates } from "@/lib/i18n";
import { getPersonalContent } from "@/lib/personal-content";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return LOCALES.filter((locale) => locale !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale) || locale === "en") return {};
  const validLoc = locale as Locale;
  const text = getPersonalContent(validLoc);
  const alternates = getRouteAlternates("/experience/ai-review-platform", validLoc);

  return {
    title: `${text.caseTitle} — Rodrigo Normando`,
    description: text.caseSummary,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale) || locale === "en") notFound();
  return <ProfessionalCasePageView locale={locale as Locale} />;
}
