import { ExperiencePageView } from "@/components/views/ExperiencePageView";
import { getPersonalContent } from "@/lib/personal-content";
import { createPageMetadata } from "@/lib/i18n";

const text = getPersonalContent("en");

export const metadata = createPageMetadata({
  title: `${text.experienceTitle} — Rodrigo Normando`,
  description: text.experienceIntro,
  pathname: "/experience",
  locale: "en",
});

export default function Page() {
  return <ExperiencePageView locale="en" />;
}
