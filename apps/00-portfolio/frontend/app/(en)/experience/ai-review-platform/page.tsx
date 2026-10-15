import { ProfessionalCasePageView } from "@/components/views/ProfessionalCasePageView";
import { getPersonalContent } from "@/lib/personal-content";
import { createPageMetadata } from "@/lib/i18n";

const text = getPersonalContent("en");

export const metadata = createPageMetadata({
  title: `${text.caseTitle} — Rodrigo Normando`,
  description: text.caseSummary,
  pathname: "/experience/ai-review-platform",
  locale: "en",
});

export default function Page() {
  return <ProfessionalCasePageView locale="en" />;
}
