import Link from "next/link";
import { ArrowDown, Code2, Layers, Users } from "lucide-react";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent } from "@/lib/personal-content";
import { ContactCard } from "@/components/ContactCard";
import { HeroArt } from "@/components/editorial/HeroArt";
import { EditorialTicker } from "@/components/editorial/EditorialTicker";
import { SelectedWork } from "@/components/editorial/SelectedWork";

const skillIcons = [Code2, Layers, Users];

export function HomePageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);

  return (
    <div className="space-y-12 sm:space-y-16 py-2">
      {/* Editorial Metadata Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-text-muted">
        <span>PORTFOLIO / 2026</span>
        <span>{text.location}</span>
      </div>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center pt-2 pb-6">
        {/* Left: Editorial Typography & Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-serif italic text-primary text-base sm:text-lg">
                {text.heroAnnotation}
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              Rodrigo Normando
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-foreground/90 font-serif">
              {text.role}
            </p>
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-text-secondary max-w-2xl">
            {text.intro}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#selected-work"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white dark:text-background hover:bg-primary-hover transition-colors shadow-sm"
              aria-label={text.workTitle}
            >
              <span>{text.workTitle}</span>
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href={getLocalizedPath("/experience", locale)}
              className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground hover:border-primary transition-colors"
            >
              {text.experienceLabel}
            </Link>
            <Link
              href={getLocalizedPath("/apps", locale)}
              className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground hover:border-primary transition-colors"
            >
              {text.projectsLabel}
            </Link>
          </div>
        </div>

        {/* Right: High-fidelity Abstract Artwork */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <HeroArt />
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
        <div className="border-b border-border pb-3">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            {text.skillsTitle}
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {text.groups.map((group, index) => {
            const Icon = skillIcons[index] || Code2;
            return (
              <div
                key={group.title}
                className="rounded-lg border border-border bg-surface p-6 space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center border border-border">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">{group.title}</h3>
                <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-text-secondary">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary font-bold">·</span>
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
