import { DatenschutzPageView } from "@/components/views/DatenschutzPageView";
import { LOCALES, Locale, isValidLocale, createPageMetadata } from "@/lib/i18n";
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
  const validLoc = locale as Locale;
  const isPt = validLoc === "pt";

  return createPageMetadata({
    title: isPt
      ? "Política de Privacidade | Rodrigo Normando"
      : "Datenschutzerklärung | Rodrigo Normando",
    description: isPt
      ? "Informações sobre tratamento de dados pessoais nas aplicações do Roadmap."
      : "Informationen zur Verarbeitung personenbezogener Daten in den Roadmap-Anwendungen.",
    pathname: "/datenschutz",
    locale: validLoc,
  });
}

export default async function LocalizedDatenschutzPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <DatenschutzPageView initialLocale={locale as Locale} />;
}
