import { getPersonalContent, LINKEDIN_URL } from "@/lib/personal-content";
import type { Locale } from "@/lib/i18n";

export function ContactCard({ locale }: { locale: Locale }) {
  const text = getPersonalContent(locale);
  return (
    <section className="rounded-xs border border-border bg-surface p-5 sm:p-7 space-y-4 font-mono">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
        <span>{"// GET_IN_TOUCH"}</span>
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{text.contactTitle}</h2>
      <p className="text-text-secondary leading-relaxed max-w-2xl font-sans text-sm">{text.contactBody}</p>
      <div>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xs bg-foreground px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
        >
          <span>[ {text.contactAction} ]</span>
        </a>
      </div>
    </section>
  );
}
