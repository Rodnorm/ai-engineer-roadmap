import { ProfessionalCasePageView } from "@/components/views/ProfessionalCasePageView";
import { getPersonalContent } from "@/lib/personal-content";
import { getRouteAlternates } from "@/lib/i18n";

const text = getPersonalContent("en");
const alternates = getRouteAlternates("/experience/ai-review-platform", "en");

export const metadata = {
  title: `${text.caseTitle} — Rodrigo Normando`,
  description: text.caseSummary,
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function Page() {
  return <ProfessionalCasePageView locale="en" />;
}
