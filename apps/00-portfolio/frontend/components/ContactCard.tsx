import { getPersonalContent, LINKEDIN_URL } from "@/lib/personal-content";
import type { Locale } from "@/lib/i18n";

export function ContactCard({ locale }: { locale: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{text.contactTitle}</h2>
      <p className="text-text-secondary leading-relaxed">{text.contactBody}</p>
      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
        {text.contactAction}
      </a>
    </section>
  );
}
