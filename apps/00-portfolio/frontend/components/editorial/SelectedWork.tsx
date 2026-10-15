"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Terminal } from "lucide-react";
import { Locale, getLocalizedPath } from "@/lib/i18n";
import { getPersonalContent, PROFESSIONAL_CASE_PATH } from "@/lib/personal-content";

interface SelectedWorkProps {
  locale?: Locale;
}

interface ProjectData {
  id: string;
  number: string;
  title: string;
  summary: string;
  tags: string[];
  href: string;
  typeLabel: string;
}

export function SelectedWork({ locale = "en" }: SelectedWorkProps) {
  const text = getPersonalContent(locale);

  const projects: ProjectData[] = [
    {
      id: "ai-review-platform",
      number: "01",
      title: text.caseTitle,
      summary: text.caseSummary,
      tags: ["FastAPI", "Human-in-the-loop", "Ollama", "Concurrency"],
      href: getLocalizedPath(PROFESSIONAL_CASE_PATH, locale),
      typeLabel: text.professionalLabel,
    },
    {
      id: "pocket-rag",
      number: "02",
      title: text.featured[0]?.title || "Pocket RAG",
      summary: text.featured[0]?.summary || "Document ingestion, retrieval and cited answers with local SQLite storage.",
      tags: ["Next.js", "FastAPI", "SQLite Vectors", "Citations"],
      href: getLocalizedPath(`/apps/${text.featured[0]?.slug || "pocket-rag"}`, locale),
      typeLabel: text.personalLabel,
    },
    {
      id: "agent-workspace",
      number: "03",
      title: text.featured[1]?.title || "Agent Workspace",
      summary: text.featured[1]?.summary || "Streaming conversations, typed MCP tools and approval flows.",
      tags: ["Next.js", "SSE Streams", "MCP 2026", "Offline Mode"],
      href: getLocalizedPath(`/apps/${text.featured[1]?.slug || "agent-workspace"}`, locale),
      typeLabel: text.personalLabel,
    },
  ];

  const [activeId, setActiveId] = useState<string>("ai-review-platform");
  const isFocusInsideRef = useRef(false);
  const clickOriginYRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Focus tracking to prevent scroll observer from stealing selection during keyboard navigation
  const handleItemFocus = useCallback((id: string) => {
    isFocusInsideRef.current = true;
    setActiveId(id);
  }, []);

  const handleItemBlur = useCallback(() => {
    // Small timeout to see if focus moved to another element inside the section
    setTimeout(() => {
      const activeEl = document.activeElement;
      if (!sectionRef.current || !activeEl || !sectionRef.current.contains(activeEl)) {
        isFocusInsideRef.current = false;
      }
    }, 50);
  }, []);

  const handleManualSelect = useCallback((id: string) => {
    setActiveId(id);
    clickOriginYRef.current = window.scrollY;
  }, []);

  // Pixel-based viewport calculation for scroll selection
  useEffect(() => {
    const handleScroll = () => {
      // 1. If keyboard focus is inside a project control, scroll observer NEVER overrides selection
      if (isFocusInsideRef.current) return;

      // 2. If user clicked a project, require at least 80px scroll delta before scroll takes over
      if (clickOriginYRef.current !== null) {
        if (Math.abs(window.scrollY - clickOriginYRef.current) < 80) {
          return;
        }
        clickOriginYRef.current = null;
      }

      if (!sectionRef.current) return;
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportCenterY = viewportHeight * 0.5;

      // Check extremes
      if (sectionRect.top > viewportCenterY) {
        setActiveId("ai-review-platform");
        return;
      }
      if (sectionRect.bottom < viewportCenterY) {
        setActiveId("agent-workspace");
        return;
      }

      // Find closest item to viewport vertical center
      let closestId = "ai-review-platform";
      let minDistance = Infinity;

      itemRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        const itemCenterY = rect.top + rect.height * 0.5;
        const distance = Math.abs(itemCenterY - viewportCenterY);
        if (distance < minDistance) {
          minDistance = distance;
          closestId = id;
        }
      });

      setActiveId(closestId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const activeIndex = projects.findIndex((p) => p.id === activeId);
  const activeCounter = `0${activeIndex + 1} / 0${projects.length}`;

  return (
    <section ref={sectionRef} className="space-y-6 pt-4" aria-label={text.workTitle}>
      <div className="border-b border-border pb-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {text.workTitle}
        </h2>
        <p className="text-text-muted text-sm mt-1">{text.workIntro}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Interactive Project List */}
        <div className="md:col-span-6 lg:col-span-6 space-y-6">
          {projects.map((project) => {
            const isActive = project.id === activeId;
            return (
              <article
                key={project.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(project.id, el);
                  else itemRefs.current.delete(project.id);
                }}
                className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? "border-primary bg-surface shadow-sm"
                    : "border-border bg-surface/50 hover:border-primary/40"
                }`}
                onFocus={() => handleItemFocus(project.id)}
                onBlur={handleItemBlur}
              >
                {/* Meta and Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full transition-opacity ${
                        isActive ? "bg-primary opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-xs font-semibold text-text-muted">
                      {project.number}
                    </span>
                    <span className="text-border" aria-hidden="true">·</span>
                    <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                      {project.typeLabel}
                    </span>
                  </div>
                  {/* Dedicated selection button separate from navigation link */}
                  <button
                    type="button"
                    onClick={() => handleManualSelect(project.id)}
                    aria-pressed={isActive}
                    aria-label={`Visualizar prévia de ${project.title}`}
                    className="text-xs font-medium text-text-muted hover:text-foreground border border-border rounded-lg px-2 py-0.5 transition-colors focus-visible:outline-primary"
                  >
                    {isActive ? "Ativo" : "Prévia"}
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  {project.title}
                </h3>

                {/* Summary */}
                <p className="text-sm leading-relaxed text-text-secondary mt-2 mb-4">
                  {project.summary}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-5" aria-label="Tecnologias">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-surface-muted border border-border text-xs font-mono text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Independent crawlable navigation link */}
                <Link
                  href={project.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline group"
                >
                  <span>{text.readCase}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  <span className="sr-only"> — {project.title}</span>
                </Link>

                {/* Mobile linear preview: displayed directly beneath project card on < 768px */}
                <div className="mt-5 md:hidden border-t border-border pt-4">
                  {renderPreviewContent(project.id)}
                </div>
              </article>
            );
          })}
        </div>

        {/* Right Column: Desktop Sticky Preview Card (hidden on mobile) */}
        <div className="hidden md:block md:col-span-6 lg:col-span-6 sticky top-20">
          <div className="p-6 lg:p-8 rounded-3xl border border-border bg-surface shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-mono text-text-muted">
              <span>SELECTED PREVIEW</span>
              <span className="font-semibold text-primary">{activeCounter}</span>
            </div>

            <div className="min-h-[360px] flex flex-col justify-center">
              {renderPreviewContent(activeId)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderPreviewContent(id: string) {
  if (id === "ai-review-platform") {
    return (
      <div className="p-5 rounded-2xl bg-surface-card border border-border space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-primary">R&D PLATFORM WORKBENCH</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
            Production slice
          </span>
        </div>
        <p className="text-sm font-semibold text-foreground">
          Human-in-the-Loop Document Verification Flow
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-surface border border-border">
            <span className="text-primary block font-bold">01. INGEST</span>
            PDF & Markdown parsing
          </div>
          <div className="p-2.5 rounded-lg bg-surface border border-border">
            <span className="text-primary block font-bold">02. MAP</span>
            Model field extraction
          </div>
          <div className="p-2.5 rounded-lg bg-surface border border-border">
            <span className="text-primary block font-bold">03. REVIEW</span>
            Optimistic lock (HTTP 409)
          </div>
          <div className="p-2.5 rounded-lg bg-surface border border-border">
            <span className="text-primary block font-bold">04. EXPORT</span>
            Audit-logged Excel / CSV
          </div>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span>800+ test suite (project)</span>
          <span className="font-mono">Python / FastAPI</span>
        </div>
      </div>
    );
  }

  if (id === "pocket-rag") {
    return (
      <div className="p-5 rounded-2xl bg-surface-card border border-border space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-primary">POCKET RAG QUERY</span>
          <span className="px-2 py-0.5 rounded bg-surface-muted text-text-muted text-[11px] font-mono">
            Demonstração com dados de exemplo
          </span>
        </div>
        <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-1.5">
          <p className="font-medium text-foreground">
            Pergunta: &quot;Quais são as condições de cancelamento do contrato de moradia?&quot;
          </p>
          <p className="text-text-muted text-[11px]">
            Fontes citadas: <span className="text-primary font-mono">[Doc: mietvertrag_beispiel.pdf §4]</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-surface/70 border border-border/80 text-xs text-text-secondary leading-relaxed">
          O aviso prévio deve ser emitido por escrito até o terceiro dia útil do mês para produzir efeito ao término do segundo mês seguinte.
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span>Local SQLite Vectors</span>
          <span className="font-mono">5 German Sample PDFs</span>
        </div>
      </div>
    );
  }

  if (id === "agent-workspace") {
    return (
      <div className="p-5 rounded-2xl bg-surface-card border border-border space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-primary">AGENT WORKSPACE SESSION</span>
          <span className="px-2 py-0.5 rounded bg-surface-muted text-text-muted text-[11px] font-mono">
            Demonstração com dados de exemplo
          </span>
        </div>
        <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-mono">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>{"tool_call: list_tasks({ status: \"pending\" })"}</span>
          </div>
          <div className="p-2 rounded bg-surface-muted text-[11px] font-mono text-text-secondary">
            → [TASK-102] Revisar acessibilidade das tabelas de dados
          </div>
        </div>
        <div className="p-3 rounded-xl bg-surface/70 border border-border/80 text-xs text-text-secondary leading-relaxed flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>Stream SSE ativo: Ferramenta executada com confirmação de escrita.</span>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span>Provedor Determinístico Offline</span>
          <span className="font-mono">MCP 2026 Compatible</span>
        </div>
      </div>
    );
  }

  return null;
}
