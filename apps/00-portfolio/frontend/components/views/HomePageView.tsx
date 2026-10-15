import Link from "next/link";
import { ArrowRight, Code2, Layers, Users } from "lucide-react";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent, PROFESSIONAL_CASE_PATH } from "@/lib/personal-content";
import { ContactCard } from "@/components/ContactCard";

const skillIcons = [Code2, Layers, Users];

export function HomePageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <div className="space-y-14 py-4">
      <section className="max-w-4xl space-y-6 py-8">
        <p className="text-sm font-semibold text-primary">{text.location}</p>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">Rodrigo Normando</h1>
        <p className="text-xl sm:text-2xl font-semibold text-foreground">{text.role}</p>
        <p className="max-w-3xl text-base sm:text-lg leading-relaxed text-text-secondary">{text.intro}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={getLocalizedPath("/experience", locale)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
            {text.experienceLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href={getLocalizedPath("/apps", locale)} className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold hover:border-primary">{text.projectsLabel}</Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3" aria-label={text.skillsTitle}>
        {text.groups.map((group, index) => {
          const Icon = skillIcons[index];
          return (
            <div key={group.title} className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold">{group.title}</h2>
              <p className="text-sm leading-relaxed text-text-muted">{group.items.slice(0, 4).join(" · ")}</p>
            </div>
          );
        })}
      </section>

      <section className="space-y-6">
        <div className="space-y-2"><h2 className="text-2xl font-bold">{text.workTitle}</h2><p className="text-text-muted">{text.workIntro}</p></div>
        <article className="rounded-3xl border border-primary/30 bg-surface p-6 sm:p-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{text.professionalLabel}</p>
          <h3 className="text-2xl font-bold">{text.caseTitle}</h3>
          <p className="max-w-3xl leading-relaxed text-text-secondary">{text.caseSummary}</p>
          <p className="text-xs font-mono text-text-muted">Python · FastAPI · Human-in-the-loop · Ollama · CI</p>
          <Link href={getLocalizedPath(PROFESSIONAL_CASE_PATH, locale)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">{text.readCase}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>
        <div className="grid gap-5 sm:grid-cols-2">
          {text.featured.map((project) => (
            <article key={project.slug} className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <p className="text-xs font-semibold text-text-muted">{text.personalLabel}</p>
              <h3 className="text-xl font-bold">{project.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{project.summary}</p>
              <Link href={getLocalizedPath(`/apps/${project.slug}`, locale)} className="text-sm font-semibold text-primary hover:underline">{text.readCase}<span className="sr-only"> — {project.title}</span></Link>
            </article>
          ))}
        </div>
      </section>
      <ContactCard locale={locale} />
    </div>
  );
}
