import type { Locale } from "./i18n/locales";

interface TextSection { title: string; body: string }
interface CareerEntry { period: string; title: string; context: string; bullets: string[] }
interface PersonalContent {
  role: string; intro: string; location: string; experienceLabel: string; projectsLabel: string;
  aboutLabel: string; roadmapLabel: string; workTitle: string; workIntro: string; readCase: string;
  contactTitle: string; contactBody: string; contactAction: string; profileTitle: string; bio: string;
  skillsTitle: string; educationTitle: string; languagesTitle: string; languages: string[]; education: string[];
  groups: { title: string; items: string[] }[]; experienceTitle: string; experienceIntro: string;
  career: CareerEntry[]; professionalLabel: string; personalLabel: string; caseTitle: string;
  caseSummary: string; caseContext: string; caseContextTitle: string; caseFlowTitle: string; flow: string[];
  caseContributionsTitle: string; caseSections: TextSection[]; outcomeTitle: string; outcome: string;
  boundary: string; backExperience: string; backHome: string; projectNote: string;
  activeLabel: string; previewLabel: string; previewAriaLabel: string; techAriaLabel: string;
  previewSampleBadge: string;
  pocketRagQuery: { question: string; sourcesLabel: string; answer: string };
  agentWorkspaceDemo: { taskLabel: string; streamStatus: string; offlineProvider: string };
  featured: { title: string; summary: string; slug: string }[];
}

export const PROFESSIONAL_CASE_PATH = "/experience/ai-review-platform";
export const LINKEDIN_URL = "https://www.linkedin.com/in/rodnorm/";
export const GITHUB_URL = "https://github.com/Rodnorm";

const content: Record<Locale, PersonalContent> = {
  "en": {
    "role": "Senior Software Engineer — Frontend & Applied AI",
    "intro": "I build accessible web interfaces and the systems behind them. My experience combines Angular, React and TypeScript with hands-on Python, FastAPI and LLM integration in professional R&D and personal projects.",
    "location": "Based in Essen, Germany",
    "experienceLabel": "Experience",
    "projectsLabel": "Personal projects",
    "aboutLabel": "About & skills",
    "roadmapLabel": "Learning roadmap",
    "workTitle": "Selected work",
    "workIntro": "Professional contributions and personal projects, with a clear account of my role and the implementation.",
    "readCase": "Read the case study",
    "contactTitle": "Let’s talk engineering",
    "contactBody": "For opportunities, project discussions or a copy of my CV, connect with me on LinkedIn.",
    "contactAction": "Contact on LinkedIn",
    "profileTitle": "About Rodrigo",
    "bio": "I am a Brazilian software engineer based in Germany. Frontend development is the foundation of my career; recent work extends into backend systems, model integration and human review workflows. My earlier experience teaching English also shapes how I explain technical decisions and collaborate across languages.",
    "skillsTitle": "Skills in context",
    "educationTitle": "Education",
    "languagesTitle": "Languages",
    "languages": [
      "Portuguese — native",
      "English — C1",
      "German — C1"
    ],
    "education": [
      "Systems Analysis and Development — Senac (2017–2019)",
      "Language Teaching degree — UNIP (2012–2015)"
    ],
    "groups": [
      {
        "title": "Frontend & accessibility",
        "items": [
          "Angular",
          "React / Next.js",
          "TypeScript / JavaScript",
          "RxJS / NgRx",
          "WCAG, keyboard and screen-reader workflows",
          "Unit and end-to-end testing"
        ]
      },
      {
        "title": "Backend & applied AI",
        "items": [
          "Python / FastAPI / Pydantic",
          "REST APIs and SSE",
          "Azure OpenAI / Foundry",
          "RAG and structured outputs",
          "Ollama and remote GPU integration",
          "Human-in-the-loop workflows"
        ]
      },
      {
        "title": "Delivery & collaboration",
        "items": [
          "GitHub Actions",
          "Docker / Coolify",
          "Code review and architecture decisions",
          "Atomic persistence and concurrency",
          "Shape Up / Scrum / Kanban",
          "Technical documentation"
        ]
      }
    ],
    "experienceTitle": "Professional experience",
    "experienceIntro": "A record of responsibilities, engineering contributions and collaboration. Recent AI work builds on a career in frontend development.",
    "career": [
      {
        "period": "September 2026 — present",
        "title": "Platform Owner & Senior Developer · internal AI R&D",
        "context": "Internal research and development initiative.",
        "bullets": [
          "Owned the platform foundation: FastAPI, versioned models, isolated project storage and CI.",
          "Delivered the review workbench and contributed to the import → mapping → human review → export flow.",
          "Implemented review transitions with concurrency control, audit trails, document import and CSV/Excel export.",
          "Reviewed pull requests, co-owned architecture decisions and temporarily facilitated the team’s Shape Up process."
        ]
      },
      {
        "period": "2020 — present",
        "title": "Frontend development · Rhein-Ruhr-Informatik",
        "context": "Consulting work in Germany, including energy and financial-services projects.",
        "bullets": [
          "Developed web interfaces with Angular and TypeScript in established engineering teams.",
          "Worked on accessibility, state management, automated testing and API integration.",
          "Collaborated on requirements, code reviews and maintainable frontend delivery."
        ]
      },
      {
        "period": "Earlier experience · Brazil",
        "title": "Software development & language teaching",
        "context": "Software projects in digital payments and hospitality technology, alongside an earlier teaching career.",
        "bullets": [
          "Contributed to software for risk and CRM contexts.",
          "Five years teaching English developed communication, explanation and facilitation skills."
        ]
      }
    ],
    "professionalLabel": "Professional work · internal R&D",
    "personalLabel": "Personal project · AI roadmap",
    "caseTitle": "AI-assisted requirements review platform",
    "caseSummary": "Platform ownership and delivery of a document-to-review workflow, combining Python services, model integration and a browser workbench.",
    "caseContext": "An internal R&D team was exploring how to connect engineering requirements with regulatory obligations while preserving human review and traceability. I owned the platform foundation and contributed across the workflow.",
    "caseContextTitle": "Context & responsibility",
    "caseFlowTitle": "The delivered workflow",
    "flow": [
      "Import Markdown / PDF",
      "Model-assisted mapping",
      "Human review",
      "CSV / Excel export"
    ],
    "caseContributionsTitle": "My engineering contributions",
    "caseSections": [
      {
        "title": "Platform & persistence",
        "body": "Bootstrapped FastAPI, configuration, typed domain models and CI. Implemented isolated project directories, atomic JSON writes, file locking and project lifecycle operations."
      },
      {
        "title": "Review & auditability",
        "body": "Implemented review-state transitions with mandatory reasoning and optimistic concurrency control. Conflicting writes return HTTP 409. Contributed hash-chained audit logging and concurrency hardening."
      },
      {
        "title": "Workbench & document flow",
        "body": "Built the browser workbench for importing documents, reviewing proposals and exporting results. Added Markdown/PDF parsing, content-based deduplication, CSV and styled Excel export with formula-injection protection."
      },
      {
        "title": "Model integration",
        "body": "Implemented typed inference and health endpoints, plus automation for an Ollama service on remote GPU infrastructure through an SSH tunnel. Demonstrated a real inference call to the team."
      },
      {
        "title": "Technical collaboration",
        "body": "Acted as PR reviewer, co-owned architecture decisions, shaped implementation proposals and temporarily facilitated Shape Up. Contributed across modules when the team needed additional coverage."
      }
    ],
    "outcomeTitle": "Outcome & scope",
    "outcome": "Demonstrated an end-to-end vertical slice that the team could extend: import, mapping, human review and export, backed by an extensive test suite of more than 800 automated tests across the project.",
    "boundary": "This case describes professional R&D contributions. Internal source code and proprietary materials are not published.",
    "backExperience": "Back to experience",
    "backHome": "Back to home",
    "projectNote": "These applications are personal learning projects. Provider modes, retained data and limitations differ by app; their READMEs describe those boundaries.",
    "activeLabel": "Active",
    "previewLabel": "Preview",
    "previewAriaLabel": "View preview for",
    "techAriaLabel": "Technologies",
    "previewSampleBadge": "Demonstration with sample data",
    "pocketRagQuery": {
      "question": "What are the cancellation terms for the residential lease?",
      "sourcesLabel": "Cited sources",
      "answer": "Notice must be given in writing by the third working day of the month to take effect at the end of the second following month."
    },
    "agentWorkspaceDemo": {
      "taskLabel": "Review accessibility of data tables",
      "streamStatus": "Active SSE stream: Tool executed with write confirmation.",
      "offlineProvider": "Offline Deterministic Provider"
    },
    "featured": [
      {
        "title": "Pocket RAG",
        "summary": "Document ingestion, retrieval and cited answers with local SQLite storage and Azure embeddings.",
        "slug": "pocket-rag"
      },
      {
        "title": "Agent Workspace",
        "summary": "Streaming conversations, typed MCP tools and approval flows, with offline and Foundry adapters.",
        "slug": "agent-workspace"
      }
    ]
  },
  "pt": {
    "role": "Engenheiro de Software Sênior — Frontend & IA Aplicada",
    "intro": "Desenvolvo interfaces acessíveis e os sistemas que as sustentam. Minha experiência combina Angular, React e TypeScript com Python, FastAPI e integração de LLMs em P&D profissional e projetos pessoais.",
    "location": "Em Essen, Alemanha",
    "experienceLabel": "Experiência",
    "projectsLabel": "Projetos pessoais",
    "aboutLabel": "Sobre & competências",
    "roadmapLabel": "Trilha de aprendizado",
    "workTitle": "Trabalhos selecionados",
    "workIntro": "Contribuições profissionais e projetos pessoais, com meu papel e a implementação descritos com clareza.",
    "readCase": "Ler estudo de caso",
    "contactTitle": "Vamos conversar sobre engenharia",
    "contactBody": "Para oportunidades, projetos ou uma cópia do meu currículo, entre em contato pelo LinkedIn.",
    "contactAction": "Contato pelo LinkedIn",
    "profileTitle": "Sobre Rodrigo",
    "bio": "Sou engenheiro de software brasileiro e moro na Alemanha. O frontend é a base da minha carreira; meu trabalho recente também abrange backend, integração de modelos e fluxos de revisão humana. A experiência anterior como professor de inglês influencia como explico decisões técnicas e colaboro em diferentes idiomas.",
    "skillsTitle": "Competências em contexto",
    "educationTitle": "Formação",
    "languagesTitle": "Idiomas",
    "languages": [
      "Português — nativo",
      "Inglês — C1",
      "Alemão — C1"
    ],
    "education": [
      "Análise e Desenvolvimento de Sistemas — Senac (2017–2019)",
      "Licenciatura em Letras — UNIP (2012–2015)"
    ],
    "groups": [
      {
        "title": "Frontend & acessibilidade",
        "items": [
          "Angular",
          "React / Next.js",
          "TypeScript / JavaScript",
          "RxJS / NgRx",
          "WCAG, teclado e leitores de tela",
          "Testes unitários e ponta a ponta"
        ]
      },
      {
        "title": "Backend & IA aplicada",
        "items": [
          "Python / FastAPI / Pydantic",
          "APIs REST e SSE",
          "Azure OpenAI / Foundry",
          "RAG e saídas estruturadas",
          "Ollama e integração com GPU remota",
          "Fluxos com revisão humana"
        ]
      },
      {
        "title": "Entrega & colaboração",
        "items": [
          "GitHub Actions",
          "Docker / Coolify",
          "Revisão de código e decisões arquiteturais",
          "Persistência atômica e concorrência",
          "Shape Up / Scrum / Kanban",
          "Documentação técnica"
        ]
      }
    ],
    "experienceTitle": "Experiência profissional",
    "experienceIntro": "Um registro de responsabilidades, contribuições de engenharia e colaboração. O trabalho recente com IA se apoia em uma trajetória no desenvolvimento frontend.",
    "career": [
      {
        "period": "Setembro de 2026 — presente",
        "title": "Platform Owner & Desenvolvedor Sênior · P&D interno com IA",
        "context": "Iniciativa interna de pesquisa e desenvolvimento.",
        "bullets": [
          "Responsável pela fundação da plataforma: FastAPI, modelos versionados, armazenamento isolado e CI.",
          "Entreguei a interface de revisão e contribuí no fluxo de importação → mapeamento → revisão humana → exportação.",
          "Implementei transições com controle de concorrência, auditoria, importação de documentos e exportação CSV/Excel.",
          "Revisei PRs, compartilhei a responsabilidade por decisões arquiteturais e facilitei temporariamente o Shape Up."
        ]
      },
      {
        "period": "2020 — presente",
        "title": "Desenvolvimento frontend · Rhein-Ruhr-Informatik",
        "context": "Atuação em consultoria na Alemanha, incluindo projetos nos setores de energia e serviços financeiros.",
        "bullets": [
          "Desenvolvimento de interfaces com Angular e TypeScript em equipes de engenharia.",
          "Trabalho com acessibilidade, gerenciamento de estado, testes automatizados e integração de APIs.",
          "Colaboração em requisitos, revisão de código e evolução sustentável do frontend."
        ]
      },
      {
        "period": "Experiência anterior · Brasil",
        "title": "Desenvolvimento de software & ensino de idiomas",
        "context": "Projetos de pagamentos digitais e tecnologia para hotelaria, além de uma carreira anterior no ensino.",
        "bullets": [
          "Contribuições em software para contextos de risco e CRM.",
          "Cinco anos como professor de inglês desenvolveram comunicação, didática e facilitação."
        ]
      }
    ],
    "professionalLabel": "Trabalho profissional · P&D interno",
    "personalLabel": "Projeto pessoal · roadmap de IA",
    "caseTitle": "Plataforma de revisão de requisitos assistida por IA",
    "caseSummary": "Responsabilidade pela plataforma e entrega de um fluxo de documentos e revisão, combinando serviços Python, integração de modelos e interface web.",
    "caseContext": "Uma equipe interna de P&D investigava como relacionar requisitos de engenharia a obrigações regulatórias, preservando revisão humana e rastreabilidade. Fui responsável pela fundação da plataforma e contribuí em diferentes etapas do fluxo.",
    "caseContextTitle": "Contexto & responsabilidade",
    "caseFlowTitle": "O fluxo entregue",
    "flow": [
      "Importação Markdown / PDF",
      "Mapeamento assistido por modelo",
      "Revisão humana",
      "Exportação CSV / Excel"
    ],
    "caseContributionsTitle": "Minhas contribuições de engenharia",
    "caseSections": [
      {
        "title": "Plataforma & persistência",
        "body": "Estruturei FastAPI, configuração, modelos de domínio tipados e CI. Implementei diretórios isolados por projeto, escrita JSON atômica, bloqueio de arquivos e operações de ciclo de vida."
      },
      {
        "title": "Revisão & rastreabilidade",
        "body": "Implementei transições de revisão com justificativa obrigatória e controle otimista de concorrência. Escritas conflitantes retornam HTTP 409. Contribuí com auditoria encadeada por hashes e correções de concorrência."
      },
      {
        "title": "Interface & fluxo documental",
        "body": "Construí a interface de importação, revisão de propostas e exportação. Adicionei parsing de Markdown/PDF, deduplicação por conteúdo, CSV e Excel formatado com proteção contra injeção de fórmulas."
      },
      {
        "title": "Integração de modelos",
        "body": "Implementei endpoints tipados de inferência e saúde, além de automação para Ollama em infraestrutura GPU remota via túnel SSH. Demonstrei uma chamada real de inferência para a equipe."
      },
      {
        "title": "Colaboração técnica",
        "body": "Atuei na revisão de PRs, compartilhei decisões arquiteturais, elaborei propostas de implementação e facilitei temporariamente o Shape Up. Contribuí em outros módulos quando a equipe precisou de apoio."
      }
    ],
    "outcomeTitle": "Resultado & escopo",
    "outcome": "Demonstrei uma entrega vertical completa que a equipe pôde evoluir: importação, mapeamento, revisão humana e exportação, com uma sólida suíte de mais de 800 testes automatizados cobrindo a plataforma.",
    "boundary": "Este caso descreve contribuições profissionais de P&D. Código-fonte interno e materiais proprietários não são publicados.",
    "backExperience": "Voltar à experiência",
    "backHome": "Voltar ao início",
    "projectNote": "Estas aplicações são projetos pessoais de aprendizado. Modos de execução, retenção de dados e limitações variam por app e estão descritos nos respectivos READMEs.",
    "activeLabel": "Ativo",
    "previewLabel": "Prévia",
    "previewAriaLabel": "Visualizar prévia de",
    "techAriaLabel": "Tecnologias",
    "previewSampleBadge": "Demonstração com dados de exemplo",
    "pocketRagQuery": {
      "question": "Quais são as condições de cancelamento do contrato de moradia?",
      "sourcesLabel": "Fontes citadas",
      "answer": "O aviso prévio deve ser emitido por escrito até o terceiro dia útil do mês para produzir efeito ao término do segundo mês seguinte."
    },
    "agentWorkspaceDemo": {
      "taskLabel": "Revisar acessibilidade das tabelas de dados",
      "streamStatus": "Stream SSE ativo: Ferramenta executada com confirmação de escrita.",
      "offlineProvider": "Provedor Determinístico Offline"
    },
    "featured": [
      {
        "title": "Pocket RAG",
        "summary": "Importação de documentos, recuperação e respostas com citações, armazenamento SQLite local e embeddings Azure.",
        "slug": "pocket-rag"
      },
      {
        "title": "Agent Workspace",
        "summary": "Conversas com streaming, ferramentas MCP tipadas e aprovação humana, com adaptadores offline e Foundry.",
        "slug": "agent-workspace"
      }
    ]
  },
  "de": {
    "role": "Senior Software Engineer — Frontend & angewandte KI",
    "intro": "Ich entwickle barrierefreie Weboberflächen und die dahinterliegenden Systeme. Meine Erfahrung verbindet Angular, React und TypeScript mit Python, FastAPI und LLM-Integration in beruflicher Forschung und Entwicklung sowie eigenen Projekten.",
    "location": "Standort Essen, Deutschland",
    "experienceLabel": "Berufserfahrung",
    "projectsLabel": "Eigene Projekte",
    "aboutLabel": "Profil & Kenntnisse",
    "roadmapLabel": "Lernpfad",
    "workTitle": "Ausgewählte Arbeiten",
    "workIntro": "Berufliche Beiträge und eigene Projekte mit klarer Beschreibung meiner Rolle und der Umsetzung.",
    "readCase": "Fallstudie lesen",
    "contactTitle": "Über Engineering sprechen",
    "contactBody": "Für Stellenangebote, Projektgespräche oder meinen Lebenslauf erreichen Sie mich auf LinkedIn.",
    "contactAction": "Kontakt über LinkedIn",
    "profileTitle": "Über Rodrigo",
    "bio": "Ich bin brasilianischer Softwareentwickler und lebe in Deutschland. Frontend-Entwicklung bildet die Grundlage meiner Laufbahn. Meine neueren Aufgaben umfassen Backend-Systeme, Modellintegration und menschliche Prüfprozesse. Meine frühere Tätigkeit als Englischlehrer prägt, wie ich technische Entscheidungen erkläre und sprachübergreifend zusammenarbeite.",
    "skillsTitle": "Kenntnisse im Kontext",
    "educationTitle": "Ausbildung",
    "languagesTitle": "Sprachen",
    "languages": [
      "Portugiesisch — Muttersprache",
      "Englisch — C1",
      "Deutsch — C1"
    ],
    "education": [
      "Studium Systemanalyse und Softwareentwicklung — Senac (2017–2019)",
      "Lehramtsstudium Sprachen — UNIP (2012–2015)"
    ],
    "groups": [
      {
        "title": "Frontend & Barrierefreiheit",
        "items": [
          "Angular",
          "React / Next.js",
          "TypeScript / JavaScript",
          "RxJS / NgRx",
          "WCAG, Tastatur- und Screenreader-Bedienung",
          "Unit- und End-to-End-Tests"
        ]
      },
      {
        "title": "Backend & angewandte KI",
        "items": [
          "Python / FastAPI / Pydantic",
          "REST-APIs und SSE",
          "Azure OpenAI / Foundry",
          "RAG und strukturierte Ausgaben",
          "Ollama und entfernte GPU-Infrastruktur",
          "Human-in-the-Loop-Prozesse"
        ]
      },
      {
        "title": "Umsetzung & Zusammenarbeit",
        "items": [
          "GitHub Actions",
          "Docker / Coolify",
          "Code-Reviews und Architekturentscheidungen",
          "Atomare Persistenz und Nebenläufigkeit",
          "Shape Up / Scrum / Kanban",
          "Technische Dokumentation"
        ]
      }
    ],
    "experienceTitle": "Berufserfahrung",
    "experienceIntro": "Verantwortlichkeiten, technische Beiträge und Zusammenarbeit. Meine neuere KI-Arbeit baut auf einer Laufbahn in der Frontend-Entwicklung auf.",
    "career": [
      {
        "period": "September 2026 — heute",
        "title": "Platform Owner & Senior Developer · interne KI-Forschung",
        "context": "Interne Forschungs- und Entwicklungsinitiative.",
        "bullets": [
          "Verantwortung für die Plattformbasis: FastAPI, versionierte Modelle, isolierte Projektdaten und CI.",
          "Entwicklung der Prüfoberfläche und Beiträge zum Ablauf Import → Zuordnung → menschliche Prüfung → Export.",
          "Implementierung von Zustandsübergängen mit Nebenläufigkeitskontrolle, Audit-Trail, Dokumentimport und CSV/Excel-Export.",
          "PR-Reviews, Mitverantwortung für Architekturentscheidungen und zeitweise Moderation des Shape-Up-Prozesses."
        ]
      },
      {
        "period": "2020 — heute",
        "title": "Frontend-Entwicklung · Rhein-Ruhr-Informatik",
        "context": "Beratungseinsätze in Deutschland, unter anderem in Energie und Finanzdienstleistungen.",
        "bullets": [
          "Entwicklung von Weboberflächen mit Angular und TypeScript in Engineering-Teams.",
          "Arbeit an Barrierefreiheit, Zustandsverwaltung, automatisierten Tests und API-Integration.",
          "Zusammenarbeit bei Anforderungen, Code-Reviews und wartbarer Frontend-Entwicklung."
        ]
      },
      {
        "period": "Frühere Erfahrung · Brasilien",
        "title": "Softwareentwicklung & Sprachunterricht",
        "context": "Softwareprojekte für digitale Zahlungen und Hoteltechnologie sowie frühere Lehrtätigkeit.",
        "bullets": [
          "Beiträge zu Software in Risiko- und CRM-Kontexten.",
          "Fünf Jahre als Englischlehrer stärkten Kommunikation, Wissensvermittlung und Moderation."
        ]
      }
    ],
    "professionalLabel": "Berufliches Projekt · interne F&E",
    "personalLabel": "Eigenes Projekt · KI-Lernpfad",
    "caseTitle": "KI-gestützte Plattform zur Anforderungsprüfung",
    "caseSummary": "Plattformverantwortung und Umsetzung eines Dokument- und Prüfprozesses mit Python-Diensten, Modellintegration und Weboberfläche.",
    "caseContext": "Ein internes Forschungsteam untersuchte die Zuordnung technischer Anforderungen zu regulatorischen Pflichten mit menschlicher Prüfung und nachvollziehbaren Entscheidungen. Ich verantwortete die Plattformbasis und trug zu mehreren Prozessschritten bei.",
    "caseContextTitle": "Kontext & Verantwortung",
    "caseFlowTitle": "Der umgesetzte Ablauf",
    "flow": [
      "Markdown- / PDF-Import",
      "Modellgestützte Zuordnung",
      "Menschliche Prüfung",
      "CSV- / Excel-Export"
    ],
    "caseContributionsTitle": "Meine technischen Beiträge",
    "caseSections": [
      {
        "title": "Plattform & Persistenz",
        "body": "Aufbau von FastAPI, Konfiguration, typisierten Domänenmodellen und CI. Implementierung isolierter Projektverzeichnisse, atomarer JSON-Schreibvorgänge, Dateisperren und Projektlebenszyklus-Operationen."
      },
      {
        "title": "Prüfung & Nachvollziehbarkeit",
        "body": "Implementierung von Prüfzuständen mit verpflichtender Begründung und optimistischer Nebenläufigkeitskontrolle. Konflikte liefern HTTP 409. Beiträge zu hashverketteten Audit-Protokollen und Nebenläufigkeitssicherheit."
      },
      {
        "title": "Oberfläche & Dokumentenfluss",
        "body": "Entwicklung der Oberfläche für Import, Vorschlagsprüfung und Export. Markdown/PDF-Parsing, inhaltsbasierte Deduplizierung sowie CSV- und formatierter Excel-Export mit Schutz vor Formelinjektion."
      },
      {
        "title": "Modellintegration",
        "body": "Implementierung typisierter Inferenz- und Statusendpunkte sowie Automatisierung für Ollama auf entfernter GPU-Infrastruktur per SSH-Tunnel. Vorführung eines echten Inferenzaufrufs im Team."
      },
      {
        "title": "Technische Zusammenarbeit",
        "body": "PR-Reviews, gemeinsame Architekturentscheidungen, Ausarbeitung von Umsetzungsvorschlägen und zeitweise Shape-Up-Moderation. Modulübergreifende Unterstützung bei zusätzlichem Bedarf im Team."
      }
    ],
    "outcomeTitle": "Ergebnis & Umfang",
    "outcome": "Vorführung eines vollständigen vertikalen Ablaufs als Grundlage für die weitere Teamentwicklung: Import, Zuordnung, menschliche Prüfung und Export, abgesichert durch eine umfassende Suite von mehr als 800 automatisierten Tests im Projekt.",
    "boundary": "Die Fallstudie beschreibt berufliche F&E-Beiträge. Interner Quellcode und proprietäre Materialien werden nicht veröffentlicht.",
    "backExperience": "Zur Berufserfahrung",
    "backHome": "Zur Startseite",
    "projectNote": "Diese Anwendungen sind eigene Lernprojekte. Ausführungsmodi, Datenspeicherung und Grenzen unterscheiden sich je App und sind in den jeweiligen READMEs beschrieben.",
    "activeLabel": "Aktiv",
    "previewLabel": "Vorschau",
    "previewAriaLabel": "Vorschau anzeigen für",
    "techAriaLabel": "Technologien",
    "previewSampleBadge": "Demonstration mit Beispieldaten",
    "pocketRagQuery": {
      "question": "Welche Kündigungsfristen gelten für den Mietvertrag?",
      "sourcesLabel": "Zitierte Quellen",
      "answer": "Die Kündigung muss bis zum dritten Werktag eines Monats schriftlich zugehen, um zum Ablauf des übernächsten Monats wirksam zu werden."
    },
    "agentWorkspaceDemo": {
      "taskLabel": "Barrierefreiheit von Datentabellen überprüfen",
      "streamStatus": "Aktiver SSE-Stream: Werkzeug mit Schreibbestätigung ausgeführt.",
      "offlineProvider": "Deterministischer Offline-Provider"
    },
    "featured": [
      {
        "title": "Pocket RAG",
        "summary": "Dokumentimport, Retrieval und zitierte Antworten mit lokaler SQLite-Speicherung und Azure-Embeddings.",
        "slug": "pocket-rag"
      },
      {
        "title": "Agent Workspace",
        "summary": "Streaming-Konversationen, typisierte MCP-Tools und Freigaben mit Offline- und Foundry-Adaptern.",
        "slug": "agent-workspace"
      }
    ]
  }
};

export function getPersonalContent(locale: Locale = "en"): PersonalContent {
  return content[locale];
}
