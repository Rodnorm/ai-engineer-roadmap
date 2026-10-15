"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Locale, getLocalizedPath } from "@/lib/i18n";

interface ImpressumPageViewProps {
  initialLocale?: Locale;
}

const CONTENT = {
  de: {
    badge: "Rechtliches",
    title: "Impressum",
    subtitle: "Kontaktinformationen",
    providerTitle: "Diensteanbieter",
    providerName: "Rodrigo Normando Horácio da Silva",
    address: "Essen, Deutschland",
    contactTitle: "Kontakt",
    emailLabel: "E-Mail",
    email: "rodrigo.normando.silva@gmail.com",
    noticeTitle: "Hinweis",
    noticeText:
      "Dieses private Portfolio präsentiert Lern- und Demonstrationsprojekte im Bereich Software- und AI-Engineering. Die bereitgestellten Anwendungen dienen Bildungs- und Evaluierungszwecken und ersetzen keine fachliche oder rechtliche Beratung.",
    privacyLinkText: "Zur Datenschutzerklärung",
  },
  en: {
    badge: "Legal",
    title: "Legal Notice (Imprint)",
    subtitle: "Contact information",
    providerTitle: "Service Provider",
    providerName: "Rodrigo Normando Horácio da Silva",
    address: "Essen, Deutschland",
    contactTitle: "Contact",
    emailLabel: "Email",
    email: "rodrigo.normando.silva@gmail.com",
    noticeTitle: "Notice",
    noticeText:
      "This personal engineering portfolio presents learning and demonstration projects in software and AI engineering. The applications are designed for educational and evaluation purposes and do not substitute professional or legal advice.",
    privacyLinkText: "View Privacy Policy",
  },
  pt: {
    badge: "Informações Legais",
    title: "Aviso Legal (Impressum)",
    subtitle: "Informações de contato",
    providerTitle: "Prestador do Serviço",
    providerName: "Rodrigo Normando Horácio da Silva",
    address: "Essen, Deutschland",
    contactTitle: "Contato",
    emailLabel: "E-mail",
    email: "rodrigo.normando.silva@gmail.com",
    noticeTitle: "Aviso",
    noticeText:
      "Este portfólio pessoal apresenta projetos educacionais e de demonstração em engenharia de software e inteligência artificial. As aplicações destinam-se a fins de demonstração técnica e aprendizado, não substituindo consultoria jurídica ou especializada.",
    privacyLinkText: "Ir para a Política de Privacidade",
  },
} as const;

export function ImpressumPageView({ initialLocale = "en" }: ImpressumPageViewProps) {
  const [activeLang, setActiveLang] = useState<Locale>(initialLocale);
  const t = CONTENT[activeLang] || CONTENT.en;

  return (
    <article className="mx-auto max-w-3xl space-y-10 py-6 text-text-secondary">
      {/* Language switcher pills */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted mr-1">Idioma / Language / Sprache:</span>
          {(["de", "en", "pt"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                activeLang === lang
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-muted hover:text-foreground"
              }`}
            >
              {lang === "de" ? "Deutsch" : lang === "en" ? "English" : "Português"}
            </button>
          ))}
        </div>
      </div>

      <header className="space-y-3">
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-primary">
          {t.badge}
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground">{t.title}</h1>
        <p className="text-sm text-text-muted">{t.subtitle}</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold text-foreground">{t.providerTitle}</h2>
        <address className="not-italic leading-relaxed">
          <strong className="text-foreground">{t.providerName}</strong>
          <br />
          {t.address}
        </address>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">{t.contactTitle}</h2>
        <p>
          {t.emailLabel}:{" "}
          <a
            href={`mailto:${t.email}`}
            className="font-semibold text-primary hover:underline"
          >
            {t.email}
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">{t.noticeTitle}</h2>
        <p className="leading-relaxed">{t.noticeText}</p>
      </section>

      <p className="border-t border-border pt-6 text-sm text-text-muted">
        <Link
          href={getLocalizedPath("/datenschutz", activeLang)}
          className="font-medium text-primary hover:underline"
        >
          {t.privacyLinkText}
        </Link>
      </p>
    </article>
  );
}
