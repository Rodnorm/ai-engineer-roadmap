import { AboutPageView } from "@/components/views/AboutPageView";
import { getDictionary, createPageMetadata } from "@/lib/i18n";

export const metadata = createPageMetadata({
  title: `About ${getDictionary("en").about.title} — Software Engineer`,
  description: getDictionary("en").about.bio,
  pathname: "/about",
  locale: "en",
});

export default function AboutPage() {
  return <AboutPageView locale="en" />;
}
