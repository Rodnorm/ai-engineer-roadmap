import { CheckCircle2, Clock, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  const roadmapSteps = [
    {
      id: "01",
      title: "App 01: Smart Inspector",
      status: "completed",
      description: "Multi-modal vision analysis, image tags, captions, object detection, OCR transcription via Azure OpenAI. Includes EXIF stripping & magic bytes image validation.",
      badge: "Vision & Multi-modal",
      link: "/apps/smart-inspector",
    },
    {
      id: "02",
      title: "App 02: Support Bot",
      status: "completed",
      description: "Healthcare billing support assistant with Azure AI Language NLP, PII data masking, and grounded FAQ retrieval isolated with prompt injection XML tags.",
      badge: "Conversational AI & RAG",
      link: "/apps/support-bot",
    },
    {
      id: "03",
      title: "App 03: Prompt Forge",
      status: "completed",
      description: "Structured content generation workbench with Azure Content Safety filtering, persona tuning, SSE real-time streaming, and client-side history.",
      badge: "Prompt Engineering & Content Gen",
      link: "/apps/prompt-forge",
    },
    {
      id: "SEC",
      title: "Security Baseline & Standards",
      status: "completed",
      description: "Monorepo public release audit, secrets scanning, Gitleaks CI, CodeQL analysis, standard FastAPI & Next.js starter templates, and Vercel isolation.",
      badge: "Security & Standards",
      link: "/apps",
    },
    {
      id: "04",
      title: "App 04: Pocket RAG",
      status: "in_progress",
      description: "Local document grounding with vector embeddings, semantic search, hybrid retrieval, and chunking strategy evaluation.",
      badge: "Vector DBs & Local RAG",
    },
    {
      id: "05",
      title: "App 05: Agentic Workflow",
      status: "planned",
      description: "Autonomous agent execution loop, multi-tool calling, state machine persistence, and human-in-the-loop validation.",
      badge: "Autonomous Agents",
    },
  ];

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      <div className="border-b border-border/80 pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-white">AI Engineering Roadmap</h1>
        <p className="text-slate-400 text-sm">
          Systematic progression from foundational LLM integrations to advanced agentic workflows and security engineering.
        </p>
      </div>

      <div className="relative border-l-2 border-border/80 ml-4 pl-6 space-y-8">
        {roadmapSteps.map((step) => {
          const isCompleted = step.status === "completed";
          const isInProgress = step.status === "in_progress";

          return (
            <div key={step.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-[35px] top-1 bg-background">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isInProgress ? (
                  <Clock className="w-5 h-5 text-primary animate-pulse" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 group-hover:border-primary/50 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium">
                      {step.id}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{step.badge}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : isInProgress
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {step.status.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>

                {step.link && (
                  <div className="pt-2">
                    <Link href={step.link} className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                      <span>View Details</span>
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
