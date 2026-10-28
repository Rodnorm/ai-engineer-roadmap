import Link from "next/link";
import { ArrowDown, Code2, Layers, Users } from "lucide-react";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent } from "@/lib/personal-content";
import { ContactCard } from "@/components/ContactCard";
import { AIArchitectureHero } from "@/components/editorial/AIArchitectureHero";
import { EditorialTicker } from "@/components/editorial/EditorialTicker";
import { SelectedWork } from "@/components/editorial/SelectedWork";

const skillIcons = [Code2, Layers, Users];

export function HomePageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);

  return (
    <div className="space-y-12 sm:space-y-16 py-2">
      {/* Editorial Metadata Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-text-muted">
        <span>PORTFOLIO // 2026</span>
        <span>{text.location}</span>
      </div>

      {/* Hero Section */}
      <section className="space-y-8 sm:space-y-10 pt-2 pb-6">
        {/* Editorial Presentation, Skills & CTAs */}
        <div className="max-w-3xl space-y-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-xs text-text-muted flex items-center gap-1.5 uppercase tracking-wider">
                <span className="text-accent font-semibold font-mono">{"//"}</span>
                {text.heroAnnotation}
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Rodrigo Normando
            </h1>
            <p className="text-lg sm:text-xl font-medium text-text-secondary font-mono tracking-tight">
              {text.role}
            </p>
          </div>

          {/* Profile Skills List */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded-xs border border-border bg-surface text-text-secondary font-medium">
              Next.js
            </span>
            <span className="px-2 py-0.5 rounded-xs border border-border bg-surface text-text-secondary font-medium">
              TypeScript
            </span>
            <span className="px-2 py-0.5 rounded-xs border border-border bg-surface text-text-secondary font-medium">
              React
            </span>
            <span className="px-2 py-0.5 rounded-xs border border-border bg-surface text-text-secondary font-medium">
              Angular
            </span>
            <span className="px-2 py-0.5 rounded-xs border border-border bg-surface text-text-secondary font-medium">
              Python / FastAPI
            </span>
            <span className="px-2 py-0.5 rounded-xs border border-border bg-surface text-text-secondary font-medium">
              RAG & Vectors
            </span>
            <span className="px-2 py-0.5 rounded-xs border border-border bg-surface text-text-secondary font-medium">
              LLM Orchestration
            </span>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-text-secondary max-w-2xl">
            {text.intro}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#selected-work"
              className="inline-flex items-center gap-2 rounded-xs bg-foreground px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-all shadow-xs"
              aria-label={text.workTitle}
            >
              <span>{text.workTitle}</span>
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <Link
              href={getLocalizedPath("/experience", locale)}
              className="rounded-xs border border-border bg-surface px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-foreground hover:border-text-muted transition-colors"
            >
              {text.experienceLabel}
            </Link>
            <Link
              href={getLocalizedPath("/apps", locale)}
              className="rounded-xs border border-border bg-surface px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-foreground hover:border-text-muted transition-colors"
            >
              {text.projectsLabel}
            </Link>
          </div>
        </div>

        {/* Full-Width Interactive AI Architecture Diagram (SVG + Motion) */}
        <div className="w-full pt-1">
          <AIArchitectureHero />
        </div>
      </section>

      {/* Scroll-linked Typographic Ticker */}
      <EditorialTicker />

      {/* Selected Work Section with Sticky Preview */}
      <div id="selected-work">
        <SelectedWork locale={locale} />
      </div>

      {/* Skills in Context */}
      <section className="space-y-6 pt-4" aria-label={text.skillsTitle}>
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-foreground">
            {"// "}{text.skillsTitle}
          </h2>
          <span className="font-mono text-xs text-text-muted">
            01 — 03
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {text.groups.map((group, index) => {
            const Icon = skillIcons[index] || Code2;
            return (
              <div
                key={group.title}
                className="rounded-xs border border-border bg-surface p-5 space-y-3 hover:border-text-muted transition-colors font-mono"
              >
                <div className="w-8 h-8 rounded-xs bg-surface-muted flex items-center justify-center border border-border">
                  <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
                <ul className="space-y-1 text-xs leading-relaxed text-text-secondary">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="text-accent font-bold">›</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Card */}
      <ContactCard locale={locale} />
    </div>
  );
}
