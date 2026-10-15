import type { Metadata } from "next";
import { DatenschutzPageView } from "@/components/views/DatenschutzPageView";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy | Rodrigo Normando",
  description: "Information regarding personal data processing across roadmap applications.",
  pathname: "/datenschutz",
  locale: "en",
});

export default function DatenschutzPage() {
  return <DatenschutzPageView initialLocale="en" />;
}
