"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Locale, getLocalizedPath } from "@/lib/i18n";

interface DatenschutzPageViewProps {
  initialLocale?: Locale;
}

interface AppRow {
  app: string;
  processing: string;
  retention: string;
}

const APP_ROWS: Record<Locale, AppRow[]> = {
  de: [
    {
      app: "Portfolio",
      processing: "Sprach- und Theme-Einstellung im Browser.",
      retention: "Bis zur Löschung im Browser.",
    },
    {
      app: "Smart Inspector",
      processing: "Hochgeladene Bilder werden von EXIF-Metadaten bereinigt und zur Analyse an Azure OpenAI übermittelt. Bilder werden nicht gespeichert.",
      retention: "Rate-Limit-Pseudonym: 24 Stunden.",
    },
    {
      app: "Support Bot",
      processing: "Nachrichtentext wird an Azure AI Language und Azure Agent/OpenAI übermittelt. Kein Chatverlauf serverseitig gespeichert.",
      retention: "Rate-Limit-Pseudonym: 24 Stunden.",
    },
    {
      app: "Prompt Forge",
      processing: "Briefing und Parameter werden an Azure Content Safety und Azure OpenAI gestreamt. Verlauf bleibt nur im Arbeitsspeicher des Browsers.",
      retention: "Rate-Limit-Pseudonym: 24 Stunden.",
    },
    {
      app: "Pocket RAG",
      processing: "Originaldokumente, extrahierte Textabschnitte und Embeddings werden vorübergehend auf dem Server gespeichert; Embeddings, Abfragen und erforderlicher Kontext werden an Azure OpenAI übermittelt.",
      retention: "Automatische Löschung nach 30 Minuten; manuelle Sofortlöschung möglich.",
    },
    {
      app: "Agentic Workflow",
      processing: "Prompt- und Workflow-Schritte werden im flüchtigen Serverspeicher verarbeitet und an Azure OpenAI gesendet.",
      retention: "Sitzung: 30 Minuten Inaktivität; Rate-Limit-Pseudonym: 24 Stunden.",
    },
    {
      app: "Agent Workspace",
      processing: "Signiertes Eigentümer-Cookie ordnet den Browser seinem Workspace zu. Konversationen im Serverspeicher/Cosmos DB isoliert.",
      retention: "Cookie: 30 Tage; Workspace-Daten: bis zur Löschung durch den Nutzer.",
    },
  ],
  en: [
    {
      app: "Portfolio",
      processing: "Language and theme preferences stored locally in the browser.",
      retention: "Until deleted in the browser.",
    },
    {
      app: "Smart Inspector",
      processing: "Uploaded images are stripped of EXIF metadata and forwarded to Azure OpenAI for vision analysis. Images are not retained.",
      retention: "Pseudonymized rate limit key: 24 hours.",
    },
    {
      app: "Support Bot",
      processing: "Message payload is processed via Azure AI Language and Azure Agent/OpenAI. No chat logs stored on server.",
      retention: "Pseudonymized rate limit key: 24 hours.",
    },
    {
      app: "Prompt Forge",
      processing: "Prompt briefing and target audience evaluated via Azure Content Safety and Azure OpenAI streaming. History volatile in memory.",
      retention: "Pseudonymized rate limit key: 24 hours.",
    },
    {
      app: "Pocket RAG",
      processing: "Original documents, extracted chunks, and embeddings are stored temporarily on the server; embeddings, queries, and required context are sent to Azure OpenAI.",
      retention: "Automatic deletion after 30 minutes; early deletion available.",
    },
    {
      app: "Agentic Workflow",
      processing: "Prompt and agentic execution steps processed in server volatile memory with Human-in-the-Loop confirmations.",
      retention: "Session: 30 minutes inactivity; Rate limit key: 24 hours.",
    },
    {
      app: "Agent Workspace",
      processing: "HMAC-signed owner cookie isolates browser conversations. Conversations stored in volatile storage / Cosmos DB.",
      retention: "Cookie: 30 days; Conversations: until deleted by user.",
    },
  ],
  pt: [
    {
      app: "Portfolio",
      processing: "Preferências de idioma e tema salvas localmente no navegador.",
      retention: "Até a limpeza pelo usuário no navegador.",
    },
    {
      app: "Smart Inspector",
      processing: "Imagens enviadas têm metadados EXIF removidos e são transmitidas ao Azure OpenAI para análise visual. Nenhuma imagem é armazenada.",
      retention: "Chave de rate limit pseudonimizada: 24 horas.",
    },
    {
      app: "Support Bot",
      processing: "Texto da mensagem é enviado ao Azure AI Language e Azure Agent/OpenAI. Nenhum histórico de chat é retido no servidor.",
      retention: "Chave de rate limit pseudonimizada: 24 horas.",
    },
    {
      app: "Prompt Forge",
      processing: "Briefing e público-alvo são enviados ao Azure Content Safety e Azure OpenAI via streaming. Histórico apenas na memória do navegador.",
      retention: "Chave de rate limit pseudonimizada: 24 horas.",
    },
    {
      app: "Pocket RAG",
      processing: "Documentos originais, trechos extraídos e embeddings são armazenados temporariamente no servidor; embeddings, consultas e o contexto necessário são enviados ao Azure OpenAI.",
      retention: "Exclusão automática em 30 minutos; exclusão imediata disponível.",
    },
    {
      app: "Agentic Workflow",
      processing: "Passos de execução autônoma do agente processados em memória volátil com portão de autorização humana (Human-in-the-Loop).",
      retention: "Sessão: 30 min de inatividade; Rate limit: 24 horas.",
    },
    {
      app: "Agent Workspace",
      processing: "Cookie assinado com HMAC isola as conversas deste navegador. Histórico armazenado no servidor / Cosmos DB de forma estrita.",
      retention: "Cookie: 30 dias; Dados do workspace: até exclusão pelo usuário.",
    },
  ],
};

const CONTENT = {
  de: {
    badge: "Rechtliches",
    title: "Datenschutzerklärung",
    date: "Stand: 20. September 2026",
    s1Title: "1. Verantwortlicher",
    controllerName: "Rodrigo Normando Horácio da Silva",
    address: "Essen, Deutschland",
    email: "rodrigo.normando.silva@gmail.com",
    s2Title: "2. Grundsatz und Zweck",
    s2Text:
      "Diese Portfolio-Anwendungen erheben keine Analytics-Daten, verwenden keine Werbung, keine Tracking-Pixel und erstellen keine geräteübergreifenden Nutzerprofile. Verarbeitet werden ausschließlich Daten, die zur Ausführung der jeweiligen Demo, zur Missbrauchsabwehr (Rate Limiting) und zur technischen Stabilität erforderlich sind.",
    s3Title: "3. Hosting und technische Protokolle",
    s3P1:
      "Die Anwendungen werden auf Servern der Hetzner Online GmbH in Deutschland über Coolify und Traefik betrieben. Beim Aufruf werden technisch notwendige Verbindungsdaten (insbesondere die IP-Adresse) verarbeitet, um Inhalte auszuliefern und Angriffe abzuwehren.",
    s3P2:
      "Anwendungsprotokolle sind so ausgelegt, dass sie nur technische Statuswerte (Dauer, HTTP-Status, Request-ID) enthalten. Eingaben, Prompts und hochgeladene Inhalte werden nicht absichtlich protokolliert. Apps mit persistentem Rate Limiting wandeln IP-Adressen vor der Speicherung über einen kryptografischen Schlüssel in ein Pseudonym um; Einträge verfallen nach 24 Stunden.",
    s3Legal:
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem und stabilem Betrieb).",
    s4Title: "4. Datenverarbeitung in den einzelnen Roadmap-Apps",
    thApp: "Anwendung",
    thProcessing: "Verarbeitung & Drittanbieter",
    thRetention: "Speicherdauer",
    s4Legal:
      "Soweit die Verarbeitung zur Erbringung der angeforderten Demo-Funktion erforderlich ist, erfolgt sie auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO; Sicherheitsmaßnahmen beruhen auf Art. 6 Abs. 1 lit. f DSGVO.",
    s5Title: "5. Empfänger und Drittlandübermittlung",
    s5Text:
      "Empfänger von Daten sind die Hetzner Online GmbH (Hosting) sowie Microsoft Azure Services (Azure OpenAI, Azure AI Language, Azure Content Safety, Azure AI Foundry). Bei der Azure-Verarbeitung können Daten innerhalb der EU oder in Drittländern verarbeitet werden; maßgeblich sind die Standardvertragsklauseln (SCC) von Microsoft.",
    s6Title: "6. Cookies und lokaler Speicher",
    s6Text:
      "Es werden ausnahmslos technisch notwendige Mechanismen eingesetzt: Speicherung der Sprach- und Theme-Einstellung sowie kryptografisch signierte Eigentümer-Cookies zur Isolierung von Arbeitsbereichen. Es kommen keine Tracking-, Profiling- oder Werbe-Cookies zum Einsatz.",
    s7Title: "7. Ihre Rechte",
    s7Text:
      "Sie haben gemäß DSGVO jederzeit das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21). Zudem besteht ein Beschwerderecht bei einer zuständigen Datenschutzaufsichtsbehörde (z. B. LDI NRW).",
    impressumLink: "Zum Impressum",
  },
  en: {
    badge: "Legal",
    title: "Privacy Policy",
    date: "Effective Date: September 20, 2026",
    s1Title: "1. Data Controller",
    controllerName: "Rodrigo Normando Horácio da Silva",
    address: "Essen, Deutschland",
    email: "rodrigo.normando.silva@gmail.com",
    s2Title: "2. Principles and Purpose",
    s2Text:
      "These engineering portfolio applications collect zero analytics data, use no advertising, deploy no tracking pixels, and build no cross-device profiles. We process only data strictly necessary to execute requested demonstrations, enforce abuse prevention (rate limiting), and ensure system availability.",
    s3Title: "3. Infrastructure & Technical Logs",
    s3P1:
      "The applications are hosted on servers provided by Hetzner Online GmbH in Germany managed via Coolify and Traefik. When requesting a page, the infrastructure processes network connection data (specifically IP addresses) to deliver content and mitigate cyber threats.",
    s3P2:
      "Application logs are designed to contain only technical telemetry (latency, status codes, request identifiers). User inputs, prompts, and document payloads are not intentionally logged. Services enforcing persistent rate limiting convert incoming IP addresses into HMAC-keyed pseudonyms; these keys expire within 24 hours.",
    s3Legal:
      "Legal basis: GDPR Art. 6(1)(f) (legitimate interest in maintaining secure, resilient, and abuse-free service availability).",
    s4Title: "4. Data Processing Across Roadmap Applications",
    thApp: "Application",
    thProcessing: "Processing & Services",
    thRetention: "Retention Window",
    s4Legal:
      "Processing required to fulfill user-initiated interactions relies on GDPR Art. 6(1)(b); defensive rate limiting relies on GDPR Art. 6(1)(f).",
    s5Title: "5. Service Providers & International Transfers",
    s5Text:
      "Data processors include Hetzner Online GmbH (server hosting) and Microsoft Azure cloud services (Azure OpenAI, Azure AI Language, Azure Content Safety, Azure AI Foundry). Data processed through Azure is governed by Microsoft's Data Protection Addendum (DPA) and Standard Contractual Clauses (SCCs).",
    s6Title: "6. Cookies & Browser Storage",
    s6Text:
      "Only strictly necessary client-side storage is utilized: locale and theme preferences in localStorage, and cryptographically signed session cookies to isolate workspaces. No third-party, advertising, or telemetry cookies are used.",
    s7Title: "7. Your Rights",
    s7Text:
      "Under GDPR and applicable data protection regulations, you have the right to access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20), and objection (Art. 21). You also have the right to lodge a complaint with a competent supervisory authority.",
    impressumLink: "View Legal Notice (Imprint)",
  },
  pt: {
    badge: "Informações Legais",
    title: "Política de Privacidade",
    date: "Data de Vigência: 20 de Setembro de 2026",
    s1Title: "1. Responsável pelo Tratamento (Controlador)",
    controllerName: "Rodrigo Normando Horácio da Silva",
    address: "Essen, Deutschland",
    email: "rodrigo.normando.silva@gmail.com",
    s2Title: "2. Princípios e Finalidade",
    s2Text:
      "Este portfólio de engenharia não coleta dados de analytics, não utiliza publicidade, não emprega pixels de rastreamento e não constrói perfis de usuários. São processados apenas os dados estritamente necessários para executar as demonstrações solicitadas, prevenir abusos de cota (rate limiting) e garantir a estabilidade técnica.",
    s3Title: "3. Hospedagem e Registros Técnicos",
    s3P1:
      "As aplicações são hospedadas em infraestrutura da Hetzner Online GmbH na Alemanha, através do Coolify e Traefik. Durante as requisições, dados técnicos de conexão (como endereço IP) são processados para entrega de tráfego e contenção de ataques cibernéticos.",
    s3P2:
      "Os logs da aplicação são projetados para conter apenas métricas técnicas (latência, código HTTP e identificador de requisição). Mensagens, prompts e documentos enviados não são registrados intencionalmente. Apps com rate limit convertem IPs em pseudônimos criptográficos descartados em até 24 horas.",
    s3Legal:
      "Base legal: Art. 6º, I, f do RGPD e Art. 7º, IX da LGPD (legítimo interesse na segurança, integridade e estabilidade das aplicações).",
    s4Title: "4. Tratamento de Dados nas Aplicações do Roadmap",
    thApp: "Aplicação",
    thProcessing: "Tratamento de Dados",
    thRetention: "Tempo de Retenção",
    s4Legal:
      "O processamento para execução das demonstrações baseia-se no cumprimento de requisição do usuário; medidas de segurança baseiam-se em legítimo interesse.",
    s5Title: "5. Destinatários e Transferência Internacional",
    s5Text:
      "Os provedores de infraestrutura incluem Hetzner Online GmbH e serviços em nuvem Microsoft Azure (Azure OpenAI, Azure AI Language, Azure Content Safety, Azure AI Foundry). Transferências para a nuvem Azure seguem garantias contratuais estritas e Cláusulas Contratuais Padrão (SCCs).",
    s6Title: "6. Cookies e Armazenamento Local",
    s6Text:
      "Utilizamos exclusivamente mecanismos estritamente necessários: salvamento de preferência de idioma e tema no navegador e cookies assinados com HMAC para isolamento de sessões e workspaces. Não existem cookies analíticos ou de marketing.",
    s7Title: "7. Seus Direitos",
    s7Text:
      "Conforme o RGPD e a LGPD, você possui direito de confirmação, acesso, correção, anonimização, bloqueio ou eliminação de dados, portabilidade e revogação. Você também tem o direito de apresentar reclamação perante a autoridade supervisora de proteção de dados competente.",
    impressumLink: "Ir para o Aviso Legal (Impressum)",
  },
} as const;

export function DatenschutzPageView({
  initialLocale = "en",
}: DatenschutzPageViewProps) {
  const [activeLang, setActiveLang] = useState<Locale>(initialLocale);
  const t = CONTENT[activeLang] || CONTENT.en;
  const rows = APP_ROWS[activeLang] || APP_ROWS.en;

  return (
    <article className="mx-auto max-w-4xl space-y-10 py-6 text-text-secondary">
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
        <p className="text-sm text-text-muted">{t.date}</p>
      </header>

      {/* 1. Data Controller */}
      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold text-foreground">{t.s1Title}</h2>
        <address className="not-italic leading-relaxed">
          <strong className="text-foreground">{t.controllerName}</strong>
          <br />
          {t.address}
          <br />
          E-Mail:{" "}
          <a
            href={`mailto:${t.email}`}
            className="font-semibold text-primary hover:underline"
          >
            {t.email}
          </a>
        </address>
      </section>

      {/* 2. Principles and Purpose */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">{t.s2Title}</h2>
        <p className="leading-relaxed">{t.s2Text}</p>
      </section>

      {/* 3. Hosting & Technical Logs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">{t.s3Title}</h2>
        <p className="leading-relaxed">{t.s3P1}</p>
        <p className="leading-relaxed">{t.s3P2}</p>
        <p className="text-xs text-text-muted">{t.s3Legal}</p>
      </section>

      {/* 4. Processing Table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">{t.s4Title}</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-muted text-foreground">
              <tr>
                <th className="p-4">{t.thApp}</th>
                <th className="p-4">{t.thProcessing}</th>
                <th className="p-4">{t.thRetention}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.app} className="border-t border-border align-top">
                  <th className="p-4 font-semibold text-foreground">{row.app}</th>
                  <td className="p-4 leading-relaxed">{row.processing}</td>
                  <td className="p-4 leading-relaxed font-mono text-xs text-text-muted">
                    {row.retention}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted">{t.s4Legal}</p>
      </section>

      {/* 5. Recipients */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">{t.s5Title}</h2>
        <p className="leading-relaxed">{t.s5Text}</p>
      </section>

      {/* 6. Cookies */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">{t.s6Title}</h2>
        <p className="leading-relaxed">{t.s6Text}</p>
      </section>

      {/* 7. Rights */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">{t.s7Title}</h2>
        <p className="leading-relaxed">{t.s7Text}</p>
      </section>

      <p className="border-t border-border pt-6 text-sm text-text-muted">
        <Link
          href={getLocalizedPath("/impressum", activeLang)}
          className="font-medium text-primary hover:underline"
        >
          {t.impressumLink}
        </Link>
      </p>
    </article>
  );
}
