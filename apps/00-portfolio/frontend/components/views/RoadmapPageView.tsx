import { CheckCircle2, Clock, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDictionary, Locale, getLocalizedPath } from "@/lib/i18n";

export function RoadmapPageView({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);

  const roadmapSteps = [
    {
      id: "01",
      title: "App 01: Smart Inspector",
      status: "completed",
      description: locale === "pt"
        ? "Inspeção visual multimodal, tags de imagem, legendas, detecção de objetos e OCR via Azure OpenAI. Inclui remoção de EXIF e validação Pillow."
        : locale === "de"
        ? "Multimodale Bildanalyse, Bildtags, Bildunterschriften, Objekterkennung und OCR via Azure OpenAI. Inklusive EXIF-Bereinigung und Pillow-Validierung."
        : "Multi-modal vision analysis, image tags, captions, object detection, OCR transcription via Azure OpenAI. Includes EXIF stripping & magic bytes image validation.",
      badge: locale === "pt" ? "Visão & Multimodal" : locale === "de" ? "Vision & Multimodal" : "Vision & Multi-modal",
      link: "/apps/smart-inspector",
    },
    {
      id: "02",
      title: "App 02: Support Bot",
      status: "completed",
      description: locale === "pt"
        ? "Assistente de suporte a faturamento médico com Azure AI Language NLP, mascaramento de PII e recuperação fundamentada de FAQ com isolamento por tags XML."
        : locale === "de"
        ? "Support-Assistent für das Gesundheitswesen mit Azure AI Language NLP, PII-Maskierung und fundiertem FAQ-Abruf mit XML-Tag-Isolierung."
        : "Healthcare billing support assistant with Azure AI Language NLP, PII data masking, and grounded FAQ retrieval isolated with prompt injection XML tags.",
      badge: locale === "pt" ? "IA Conversacional & RAG" : locale === "de" ? "Konversationelle KI & RAG" : "Conversational AI & RAG",
      link: "/apps/support-bot",
    },
    {
      id: "03",
      title: "App 03: Prompt Forge",
      status: "completed",
      description: locale === "pt"
        ? "Estúdio de geração de conteúdo estruturado com Azure Content Safety, personas, streaming SSE em tempo real e histórico no cliente."
        : locale === "de"
        ? "Workbench für strukturierte Inhaltserstellung mit Azure Content Safety Filterung, Persona-Tuning, SSE-Echtzeit-Streaming und Client-Historie."
        : "Structured content generation workbench with Azure Content Safety filtering, persona tuning, SSE real-time streaming, and client-side history.",
      badge: locale === "pt" ? "Engenharia de Prompt" : locale === "de" ? "Prompt Engineering" : "Prompt Engineering & Content Gen",
      link: "/apps/prompt-forge",
    },
    {
      id: "SEC",
      title: locale === "pt" ? "Linha de Base & Padrões de Segurança" : locale === "de" ? "Sicherheitsstandards & Baseline" : "Security Baseline & Standards",
      status: "completed",
      description: locale === "pt"
        ? "Auditoria para release público, varredura de segredos, CI com Gitleaks e CodeQL, templates base e isolamento de deploy."
        : locale === "de"
        ? "Release-Audit, Secrets-Scanning, Gitleaks- und CodeQL-CI, standardisierte Starter-Templates und Deploy-Isolierung."
        : "Monorepo public release audit, secrets scanning, Gitleaks CI, CodeQL analysis, standard FastAPI & Next.js starter templates, and deployment isolation.",
      badge: locale === "pt" ? "Segurança & Padrões" : locale === "de" ? "Sicherheit & Standards" : "Security & Standards",
      link: "/apps",
    },
    {
      id: "04",
      title: "App 04: Pocket RAG",
      status: "in_progress",
      description: locale === "pt"
        ? "Fundamentação documental local com embeddings vetoriais, busca semântica, recuperação híbrida e avaliação de chunking."
        : locale === "de"
        ? "Lokale Dokumentengrundung mit Vektor-Embeddings, semantischer Suche, hybrider Abfrage und Chunking-Strategie-Evaluierung."
        : "Local document grounding with vector embeddings, semantic search, hybrid retrieval, and chunking strategy evaluation.",
      badge: "Vector DBs & Local RAG",
    },
    {
      id: "05",
      title: "App 05: Agentic Workflow",
      status: "completed",
      description: locale === "pt"
        ? "Loop autônomo de agentes, múltiplas ferramentas (tool calling), persistência de máquina de estados e validação humana."
        : locale === "de"
        ? "Autonome Agenten-Ausführungsschleife, Multi-Tool-Aufrufe, State-Machine-Persistenz und Human-in-the-Loop-Validierung."
        : "Autonomous agent execution loop, multi-tool calling, state machine persistence, and human-in-the-loop validation.",
      badge: "Autonomous Agents",
      link: "/apps/agentic-workflow",
    },
  ];

  const getStatusLabel = (status: string) => {
    if (status === "completed") return dict.roadmap.statusCompleted;
    if (status === "in_progress") return dict.roadmap.statusInProgress;
    return dict.roadmap.statusPlanned;
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-foreground">{dict.roadmap.title}</h1>
        <p className="text-text-muted text-sm">{dict.roadmap.subtitle}</p>
      </div>

      <div className="relative border-l-2 border-border ml-4 pl-6 space-y-8">
        {roadmapSteps.map((step) => {
          const isCompleted = step.status === "completed";
          const isInProgress = step.status === "in_progress";

          return (
            <div key={step.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-[35px] top-1 bg-background">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : isInProgress ? (
                  <Clock className="w-5 h-5 text-primary animate-pulse" />
                ) : (
                  <Circle className="w-5 h-5 text-text-muted" />
                )}
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 group-hover:border-primary/50 transition-all shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary text-xs font-mono font-medium">
                      {step.id}
                    </span>
                    <span className="text-xs text-text-muted font-semibold">{step.badge}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : isInProgress
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-surface-muted text-text-muted"
                    }`}
                  >
                    {getStatusLabel(step.status)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>

                {step.link && (
                  <div className="pt-2">
                    <Link
                      href={getLocalizedPath(step.link, locale)}
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                    >
                      <span>{dict.roadmap.viewDetails}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
