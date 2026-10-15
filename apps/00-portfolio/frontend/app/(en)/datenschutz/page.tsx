import type { Metadata } from "next";
import { DatenschutzPageView } from "@/components/views/DatenschutzPageView";
import { getRouteAlternates } from "@/lib/i18n";

const alternates = getRouteAlternates("/datenschutz", "en");

export const metadata: Metadata = {
  title: "Privacy Policy | Rodrigo Normando",
  description: "Information regarding personal data processing across roadmap applications.",
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function DatenschutzPage() {
  return <DatenschutzPageView initialLocale="en" />;
}
