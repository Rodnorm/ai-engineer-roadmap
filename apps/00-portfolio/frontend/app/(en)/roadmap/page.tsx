import { RoadmapPageView } from "@/components/views/RoadmapPageView";
import { getDictionary, getRouteAlternates } from "@/lib/i18n";

const dict = getDictionary("en");
const alternates = getRouteAlternates("/roadmap", "en");

export const metadata = {
  title: `${dict.roadmap.title} — ${dict.meta.siteTitle}`,
  description: dict.roadmap.subtitle,
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function RoadmapPage() {
  return <RoadmapPageView locale="en" />;
}
