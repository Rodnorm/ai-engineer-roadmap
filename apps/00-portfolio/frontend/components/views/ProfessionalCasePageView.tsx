import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent } from "@/lib/personal-content";

export function ProfessionalCasePageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);

  return (
    <article className="max-w-4xl mx-auto space-y-10 py-4">
      <Link
        href={getLocalizedPath("/experience", locale)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{text.backExperience}</span>
      </Link>

      <header className="space-y-4 border-b border-border pb-8">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
            {text.professionalLabel}
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          {text.caseTitle}
        </h1>
        <p className="text-lg sm:text-xl leading-relaxed text-text-secondary max-w-3xl">
          {text.caseSummary}
        </p>
      </header>

      {/* Context */}
      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {text.caseContextTitle}
        </h2>
        <p className="leading-relaxed text-text-secondary text-base sm:text-lg">
          {text.caseContext}
        </p>
      </section>

      {/* Flow */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {text.caseFlowTitle}
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {text.flow.map((step, index) => (
            <li
              key={step}
              className="rounded-xl border border-border bg-surface p-4 flex items-start gap-3 shadow-sm"
            >
              <span className="text-primary font-mono font-bold text-sm">
                0{index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Contributions */}
      <section className="space-y-5">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {text.caseContributionsTitle}
        </h2>
        <div className="grid gap-4">
          {text.caseSections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-border bg-surface p-6 sm:p-7 space-y-3 shadow-sm"
            >
              <h3 className="font-serif text-lg font-bold text-foreground">
                {section.title}
              </h3>
              <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Outcome and boundary */}
      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {text.outcomeTitle}
        </h2>
        <p className="leading-relaxed text-text-secondary text-base">
          {text.outcome}
        </p>
        <div className="p-4 rounded-xl bg-surface border border-border/80 text-xs text-text-muted leading-relaxed">
          {text.boundary}
        </div>
      </section>
    </article>
  );
}
