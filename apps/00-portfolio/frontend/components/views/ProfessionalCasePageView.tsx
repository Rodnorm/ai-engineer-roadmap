import Link from "next/link";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent } from "@/lib/personal-content";

export function ProfessionalCasePageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <article className="max-w-4xl mx-auto space-y-9 py-4">
      <Link href={getLocalizedPath("/experience", locale)} className="text-sm font-semibold text-primary hover:underline">← {text.backExperience}</Link>
      <header className="space-y-4"><p className="text-sm text-primary font-semibold">{text.professionalLabel}</p><h1 className="text-3xl sm:text-4xl font-extrabold">{text.caseTitle}</h1><p className="text-lg leading-relaxed text-text-secondary">{text.caseSummary}</p></header>
      <section className="space-y-3"><h2 className="text-2xl font-bold">{text.caseContextTitle}</h2><p className="leading-relaxed text-text-secondary">{text.caseContext}</p></section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{text.caseFlowTitle}</h2>
        <ol className="grid gap-3 sm:grid-cols-2">{text.flow.map((step, index) => <li key={step} className="rounded-xl border border-border bg-surface p-4"><span className="text-primary font-mono mr-3">0{index + 1}</span>{step}</li>)}</ol>
      </section>
      <section className="space-y-5"><h2 className="text-2xl font-bold">{text.caseContributionsTitle}</h2>{text.caseSections.map((section) => <div key={section.title} className="rounded-2xl border border-border bg-surface p-6 space-y-3"><h3 className="text-lg font-bold">{section.title}</h3><p className="text-text-secondary leading-relaxed">{section.body}</p></div>)}</section>
      <section className="space-y-4 border-t border-border pt-7"><h2 className="text-2xl font-bold">{text.outcomeTitle}</h2><p className="leading-relaxed text-text-secondary">{text.outcome}</p><p className="text-sm leading-relaxed text-text-muted">{text.boundary}</p></section>
    </article>
  );
}
