import Link from "next/link";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent, PROFESSIONAL_CASE_PATH } from "@/lib/personal-content";
import { ContactCard } from "@/components/ContactCard";

export function ExperiencePageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <header className="space-y-3"><h1 className="text-3xl sm:text-4xl font-extrabold">{text.experienceTitle}</h1><p className="text-text-secondary leading-relaxed">{text.experienceIntro}</p></header>
      <ol className="space-y-6 border-l-2 border-border pl-5 sm:pl-8">
        {text.career.map((entry, index) => (
          <li key={entry.title} className="rounded-2xl border border-border bg-surface p-5 sm:p-7 space-y-4">
            <p className="text-sm font-semibold text-primary">{entry.period}</p>
            <h2 className="text-xl font-bold">{entry.title}</h2>
            <p className="text-sm leading-relaxed text-text-muted">{entry.context}</p>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm leading-relaxed">{entry.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            {index === 0 ? <Link href={getLocalizedPath(PROFESSIONAL_CASE_PATH, locale)} className="inline-block text-sm font-semibold text-primary hover:underline">{text.readCase}</Link> : null}
          </li>
        ))}
      </ol>
      <ContactCard locale={locale} />
    </div>
  );
}
