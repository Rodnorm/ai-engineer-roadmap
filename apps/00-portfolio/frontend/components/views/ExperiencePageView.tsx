import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent, PROFESSIONAL_CASE_PATH } from "@/lib/personal-content";
import { ContactCard } from "@/components/ContactCard";

export function ExperiencePageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <header className="space-y-3 border-b border-border pb-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground">
          {text.experienceTitle}
        </h1>
        <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
          {text.experienceIntro}
        </p>
      </header>

      <ol className="space-y-8 border-l-2 border-border pl-5 sm:pl-8">
        {text.career.map((entry, index) => (
          <li
            key={entry.title}
            className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                {entry.period}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              {entry.title}
            </h2>
            <p className="text-sm leading-relaxed text-text-muted italic">{entry.context}</p>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm leading-relaxed">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {index === 0 && (
              <div className="pt-2">
                <Link
                  href={getLocalizedPath(PROFESSIONAL_CASE_PATH, locale)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline group"
                >
                  <span>{text.readCase}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            )}
          </li>
        ))}
      </ol>

      <ContactCard locale={locale} />
    </div>
  );
}
