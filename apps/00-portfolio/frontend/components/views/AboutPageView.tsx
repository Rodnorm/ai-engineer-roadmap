import Link from "next/link";
import Image from "next/image";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getPersonalContent, GITHUB_URL, LINKEDIN_URL } from "@/lib/personal-content";
import { ContactCard } from "@/components/ContactCard";

export function AboutPageView({ locale = "en" }: { locale?: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <Image src="/profile.jpg" alt="Rodrigo Normando" width={96} height={96} className="rounded-full object-cover h-24 w-24 border-2 border-primary/30" priority />
          <div className="min-w-0 space-y-2"><h1 className="text-3xl font-extrabold">{text.profileTitle}</h1><p className="font-semibold text-primary">{text.role}</p><p className="text-sm text-text-muted">{text.location}</p></div>
        </div>
        <p className="text-text-secondary leading-relaxed">{text.bio}</p>
        <div className="flex flex-wrap gap-5 text-sm font-semibold text-primary"><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a><Link href={getLocalizedPath("/experience", locale)} className="hover:underline">{text.experienceLabel}</Link></div>
      </section>
      <section className="space-y-5"><h2 className="text-2xl font-bold">{text.skillsTitle}</h2><div className="grid gap-5 sm:grid-cols-2">{text.groups.map((group) => <div key={group.title} className="rounded-2xl border border-border bg-surface p-6 space-y-4"><h3 className="text-lg font-bold text-primary">{group.title}</h3><ul className="space-y-2 text-sm text-text-secondary">{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}</div></section>
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 space-y-4"><h2 className="text-xl font-bold">{text.educationTitle}</h2><ul className="space-y-3 text-sm text-text-secondary">{text.education.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="rounded-2xl border border-border bg-surface p-6 space-y-4"><h2 className="text-xl font-bold">{text.languagesTitle}</h2><ul className="space-y-3 text-sm text-text-secondary">{text.languages.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
      </div>
      <Link href={getLocalizedPath("/roadmap", locale)} className="inline-block font-semibold text-primary hover:underline">{text.roadmapLabel} →</Link>
      <ContactCard locale={locale} />
    </div>
  );
}
