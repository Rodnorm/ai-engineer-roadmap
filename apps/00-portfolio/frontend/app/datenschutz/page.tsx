import type { Metadata } from "next";
import { DatenschutzPageView } from "@/components/views/DatenschutzPageView";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Engineer Roadmap",
  description: "Information regarding personal data processing across roadmap applications.",
};

export default function DatenschutzPage() {
  return <DatenschutzPageView initialLocale="en" />;
}
