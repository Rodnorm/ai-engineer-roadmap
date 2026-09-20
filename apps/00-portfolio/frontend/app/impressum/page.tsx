import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum | AI Engineer Roadmap",
  description: "Anbieterkennzeichnung für normando.dev und die AI Engineer Roadmap Apps.",
};

export default function ImpressumPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 py-6 text-text-secondary">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Rechtliches</p>
        <h1 className="text-4xl font-bold text-foreground">Impressum</h1>
        <p className="text-sm text-text-muted">Angaben gemäß § 5 DDG</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Anbieter</h2>
        <address className="not-italic">
          Rodrigo Normando Horácio da Silva<br />
          <strong>[POSTANSCHRIFT VOR VERÖFFENTLICHUNG EINTRAGEN]</strong>
        </address>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Kontakt</h2>
        <p>E-Mail: <strong>[E-MAIL VOR VERÖFFENTLICHUNG EINTRAGEN]</strong></p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Hinweis</h2>
        <p>
          Dieses private Portfolio präsentiert Lern- und Demonstrationsprojekte im Bereich
          Software- und AI-Engineering. Die Anwendungen ersetzen keine fachliche Beratung.
        </p>
      </section>

      <p className="border-t border-border pt-6 text-sm text-text-muted">
        <Link href="/datenschutz" className="font-medium text-primary hover:underline">
          Zur Datenschutzerklärung
        </Link>
      </p>
    </article>
  );
}
