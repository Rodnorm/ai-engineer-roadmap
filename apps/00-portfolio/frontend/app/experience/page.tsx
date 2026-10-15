import { ExperiencePageView } from "@/components/views/ExperiencePageView";
import { getPersonalContent } from "@/lib/personal-content";

export const metadata = { title: `${getPersonalContent("en").experienceTitle} — Rodrigo Normando`, description: getPersonalContent("en").experienceIntro };

export default function Page() { return <ExperiencePageView locale="en" />; }
