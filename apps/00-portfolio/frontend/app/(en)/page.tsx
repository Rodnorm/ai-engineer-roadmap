import { HomePageView } from "@/components/views/HomePageView";
import { getDictionary, getRouteAlternates } from "@/lib/i18n";

const alternates = getRouteAlternates("/", "en");

export const metadata = {
  title: getDictionary("en").meta.siteTitle,
  description: getDictionary("en").meta.siteDescription,
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function HomePage() {
  return <HomePageView locale="en" />;
}
