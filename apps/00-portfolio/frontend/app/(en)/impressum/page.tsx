import type { Metadata } from "next";
import { ImpressumPageView } from "@/components/views/ImpressumPageView";
import { getRouteAlternates } from "@/lib/i18n";

const alternates = getRouteAlternates("/impressum", "en");

export const metadata: Metadata = {
  title: "Legal Notice (Impressum) | Rodrigo Normando",
  description: "Provider identification and legal notice for normando.dev and roadmap apps.",
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function ImpressumPage() {
  return <ImpressumPageView initialLocale="en" />;
}
