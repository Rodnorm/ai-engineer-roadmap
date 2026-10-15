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
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border border-border shadow-inner">
            <Image
              src="/profile.jpg"
              alt="Rodrigo Normando"
              width={112}
              height={112}
              className="object-cover h-full w-full"
              priority
            />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-foreground">
              {text.profileTitle}
            </h1>
            <p className="font-serif font-semibold text-primary text-base sm:text-lg">
              {text.role}
            </p>
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted">
              {text.location}
            </p>
          </div>
        </div>

        <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
          {text.bio}
        </p>

        <div className="flex flex-wrap gap-5 text-sm font-semibold text-primary pt-2 border-t border-border">
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
            LinkedIn ↗
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
            GitHub ↗
          </a>
          <Link href={getLocalizedPath("/experience", locale)} className="hover:underline">
            {text.experienceLabel} →
          </Link>
        </div>
      </section>

      {/* Skills in Context */}
      <section className="space-y-5">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {text.skillsTitle}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {text.groups.map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm"
            >
              <h3 className="font-serif text-lg font-bold text-primary">
                {group.title}
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-primary font-bold">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education & Languages */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-foreground">
            {text.educationTitle}
          </h2>
          <ul className="space-y-3 text-sm text-text-secondary">
            {text.education.map((entry) => (
              <li key={entry} className="leading-relaxed">
                {entry}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-foreground">
            {text.languagesTitle}
          </h2>
          <ul className="space-y-3 text-sm text-text-secondary">
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
