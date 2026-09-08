import { RoadmapPageView } from "@/components/views/RoadmapPageView";
import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: `${getDictionary("en").roadmap.title} — ${getDictionary("en").meta.siteTitle}`,
  description: getDictionary("en").roadmap.subtitle,
};

export default function RoadmapPage() {
  return <RoadmapPageView locale="en" />;
}
