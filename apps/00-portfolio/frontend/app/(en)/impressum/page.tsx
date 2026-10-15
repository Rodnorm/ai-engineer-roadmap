import type { Metadata } from "next";
import { ImpressumPageView } from "@/components/views/ImpressumPageView";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata({
  title: "Legal Notice (Impressum) | Rodrigo Normando",
  description: "Provider identification and legal notice for normando.dev and roadmap apps.",
  pathname: "/impressum",
  locale: "en",
});

export default function ImpressumPage() {
  return <ImpressumPageView initialLocale="en" />;
}
