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

      <ol className="space-y-6 border-l border-border pl-5 sm:pl-8">
        {text.career.map((entry, index) => (
          <li
            key={entry.title}
            className="rounded-xs border border-border bg-surface p-5 sm:p-7 space-y-3.5 hover:border-text-muted transition-colors font-mono"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted">
                [{entry.period}]
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              {entry.title}
            </h2>
            <p className="text-xs leading-relaxed text-text-muted font-sans italic">{entry.context}</p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-secondary text-xs sm:text-sm leading-relaxed font-sans">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {index === 0 && (
              <div className="pt-2 font-mono">
                <Link
                  href={getLocalizedPath(PROFESSIONAL_CASE_PATH, locale)}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-foreground hover:text-accent group"
                >
                  <span>[ {text.readCase} ]</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
