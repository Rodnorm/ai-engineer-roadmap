import { ExperiencePageView } from "@/components/views/ExperiencePageView";
import { getPersonalContent } from "@/lib/personal-content";
import { getRouteAlternates } from "@/lib/i18n";

const text = getPersonalContent("en");
const alternates = getRouteAlternates("/experience", "en");

export const metadata = {
  title: `${text.experienceTitle} — Rodrigo Normando`,
  description: text.experienceIntro,
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function Page() {
  return <ExperiencePageView locale="en" />;
}
