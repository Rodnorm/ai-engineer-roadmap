import { ImpressumPageView } from "@/components/views/ImpressumPageView";
import { LOCALES, Locale, isValidLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return LOCALES.filter((l) => l !== "en").map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const isPt = locale === "pt";
  return {
    title: isPt
      ? "Aviso Legal (Impressum) | AI Engineer Roadmap"
      : "Impressum | AI Engineer Roadmap",
    description: isPt
      ? "Identificação do provedor e aviso legal de normando.dev."
      : "Anbieterkennzeichnung für normando.dev und die AI Engineer Roadmap Apps.",
  };
}

export default async function LocalizedImpressumPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <ImpressumPageView initialLocale={locale as Locale} />;
}
