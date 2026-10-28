import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent, GITHUB_URL, LINKEDIN_URL } from "@/lib/personal-content";
import { ContactCard } from "@/components/ContactCard";

export function AboutPageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <section className="rounded-xs border border-border bg-surface p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xs overflow-hidden border border-border">
            <Image
              src="/profile.jpg"
              alt="Rodrigo Normando"
              width={96}
              height={96}
              className="object-cover h-full w-full"
              priority
            />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
              {text.profileTitle}
            </h1>
            <p className="font-mono font-semibold text-text-secondary text-sm sm:text-base">
              {text.role}
            </p>
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              {text.location}
            </p>
          </div>
        </div>

        <p className="text-text-secondary text-sm sm:text-base leading-relaxed font-sans">
          {text.bio}
        </p>

        <div className="flex flex-wrap gap-4 text-xs font-mono font-semibold uppercase tracking-wider pt-3 border-t border-border">
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            [ LinkedIn ↗ ]
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            [ GitHub ↗ ]
          </a>
          <Link href={getLocalizedPath("/experience", locale)} className="hover:text-accent">
            [ {text.experienceLabel} → ]
          </Link>
        </div>
      </section>

      {/* Skills in Context */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-foreground">
            {"// "}{text.skillsTitle}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {text.groups.map((group) => (
            <div
              key={group.title}
              className="rounded-xs border border-border bg-surface p-5 space-y-3 font-mono"
            >
              <h3 className="text-sm font-bold text-foreground">
                {group.title}
              </h3>
              <ul className="space-y-1.5 text-xs text-text-secondary font-sans">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <span className="text-accent font-bold font-mono">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education & Languages */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xs border border-border bg-surface p-5 space-y-3 font-mono">
          <h2 className="text-sm font-bold text-foreground">
            {"// "}{text.educationTitle}
          </h2>
          <ul className="space-y-2 text-xs text-text-secondary font-sans">
            {text.education.map((entry) => (
              <li key={entry} className="leading-relaxed">
                {entry}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xs border border-border bg-surface p-5 space-y-3 font-mono">
          <h2 className="text-sm font-bold text-foreground">
            {"// "}{text.languagesTitle}
          </h2>
          <ul className="space-y-2 text-xs text-text-secondary font-sans">
            {text.languages.map((entry) => (
              <li key={entry} className="leading-relaxed">
                {entry}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="pt-2">
        <Link
          href={getLocalizedPath("/roadmap", locale)}
          className="inline-flex items-center gap-2 font-semibold text-primary hover:underline group text-base"
        >
          <span>{text.roadmapLabel}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>

      <ContactCard locale={locale} />
    </div>
  );
}
