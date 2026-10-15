import { getPersonalContent, LINKEDIN_URL } from "@/lib/personal-content";
import type { Locale } from "@/lib/i18n";

export function ContactCard({ locale }: { locale: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 space-y-4">
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{text.contactTitle}</h2>
      <p className="text-text-secondary leading-relaxed max-w-2xl">{text.contactBody}</p>
      <div>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white dark:text-background hover:bg-primary-hover transition-colors"
        >
          {text.contactAction}
        </a>
      </div>
    </section>
  );
}
