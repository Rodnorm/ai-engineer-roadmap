import { HomePageView } from "@/components/views/HomePageView";
import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: getDictionary("en").meta.siteTitle,
  description: getDictionary("en").meta.siteDescription,
};

export default function HomePage() {
  return <HomePageView locale="en" />;
}
