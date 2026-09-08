import { AboutPageView } from "@/components/views/AboutPageView";
import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: `About ${getDictionary("en").about.title} — AI Engineer`,
  description: getDictionary("en").about.bio,
};

export default function AboutPage() {
  return <AboutPageView locale="en" />;
}
