import { ProfessionalCasePageView } from "@/components/views/ProfessionalCasePageView";
import { getPersonalContent } from "@/lib/personal-content";

export const metadata = { title: `${getPersonalContent("en").caseTitle} — Rodrigo Normando`, description: getPersonalContent("en").caseSummary };

export default function Page() { return <ProfessionalCasePageView locale="en" />; }
