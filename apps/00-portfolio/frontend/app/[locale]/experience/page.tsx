import { notFound } from "next/navigation";
import { ExperiencePageView } from "@/components/views/ExperiencePageView";
import { LOCALES, isValidLocale } from "@/lib/i18n";
import { getPersonalContent } from "@/lib/personal-content";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() { return LOCALES.filter((locale) => locale !== "en").map((locale) => ({ locale })); }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale) || locale === "en") return {};
  const text = getPersonalContent(locale);
  return { title: `${text.experienceTitle} — Rodrigo Normando`, description: text.experienceIntro };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale) || locale === "en") notFound();
  return <ExperiencePageView locale={locale} />;
}
