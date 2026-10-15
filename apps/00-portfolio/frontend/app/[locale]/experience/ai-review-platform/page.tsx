import { notFound } from "next/navigation";
import { ProfessionalCasePageView } from "@/components/views/ProfessionalCasePageView";
import { LOCALES, Locale, isValidLocale, createPageMetadata } from "@/lib/i18n";
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

  return createPageMetadata({
    title: `${text.caseTitle} — Rodrigo Normando`,
    description: text.caseSummary,
    pathname: "/experience/ai-review-platform",
    locale: validLoc,
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale) || locale === "en") notFound();
  return <ProfessionalCasePageView locale={locale as Locale} />;
}
