import { AboutPageView } from "@/components/views/AboutPageView";
import { getDictionary, getRouteAlternates } from "@/lib/i18n";

const alternates = getRouteAlternates("/about", "en");

export const metadata = {
  title: `About ${getDictionary("en").about.title} — Software Engineer`,
  description: getDictionary("en").about.bio,
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function AboutPage() {
  return <AboutPageView locale="en" />;
}
