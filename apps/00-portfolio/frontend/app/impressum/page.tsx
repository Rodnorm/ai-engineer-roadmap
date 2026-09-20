import type { Metadata } from "next";
import { ImpressumPageView } from "@/components/views/ImpressumPageView";

export const metadata: Metadata = {
  title: "Legal Notice (Impressum) | AI Engineer Roadmap",
  description: "Provider identification and legal notice for normando.dev and roadmap apps.",
};

export default function ImpressumPage() {
  return <ImpressumPageView initialLocale="en" />;
}
