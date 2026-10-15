import { RoadmapPageView } from "@/components/views/RoadmapPageView";
import { getDictionary, createPageMetadata } from "@/lib/i18n";

const dict = getDictionary("en");

export const metadata = createPageMetadata({
  title: `${dict.roadmap.title} — ${dict.meta.siteTitle}`,
  description: dict.roadmap.subtitle,
  pathname: "/roadmap",
  locale: "en",
});

export default function RoadmapPage() {
  return <RoadmapPageView locale="en" />;
}
