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

  const handleManualSelect = useCallback((id: string, e?: React.MouseEvent) => {
    setActiveId(id);
    clickOriginYRef.current = window.scrollY;
    // Release focus from click so it doesn't lock scroll selection
    isFocusInsideRef.current = false;
    if (e?.currentTarget) {
      (e.currentTarget as HTMLElement).blur();
    }
  }, []);

  // Pixel-based viewport calculation for scroll selection
  useEffect(() => {
    const handleScroll = () => {
      // 1. If user clicked a project, require at least 80px scroll delta before scroll takes over
      if (clickOriginYRef.current !== null) {
        if (Math.abs(window.scrollY - clickOriginYRef.current) < 80) {
          return;
        }
        clickOriginYRef.current = null;
        isFocusInsideRef.current = false;
      }

      // 2. If genuine keyboard navigation is inside a project control, don't override selection
      if (isFocusInsideRef.current) return;

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
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-foreground">
            {"// "}{text.workTitle}
          </h2>
          <p className="text-text-muted font-mono text-xs mt-1">{text.workIntro}</p>
        </div>
        <span className="font-mono text-xs text-text-muted hidden sm:inline">
          INDEX 01 — 03
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Interactive Project List */}
        <div className="md:col-span-6 lg:col-span-6 space-y-4">
          {projects.map((project) => {
            const isActive = project.id === activeId;
            return (
              <article
                key={project.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(project.id, el);
                  else itemRefs.current.delete(project.id);
                }}
                className={`p-5 sm:p-6 rounded-xs border transition-all duration-150 ${
                  isActive
                    ? "border-foreground bg-surface shadow-xs"
                    : "border-border bg-surface/40 hover:border-text-muted"
                }`}
                onFocus={() => handleItemFocus(project.id)}
                onBlur={handleItemBlur}
              >
                {/* Meta and Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full transition-opacity ${
                        isActive ? "bg-emerald-500 opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-xs font-semibold text-text-muted">
                      [{project.number}]
                    </span>
                    <span className="text-border font-mono" aria-hidden="true">/</span>
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-text-secondary">
                      {project.typeLabel}
                    </span>
                  </div>
                  {/* Dedicated selection button separate from navigation link */}
                  <button
                    type="button"
                    onClick={(e) => handleManualSelect(project.id, e)}
                    aria-pressed={isActive}
                    aria-label={`${text.previewAriaLabel} ${project.title}`}
                    className="text-[10px] font-mono uppercase font-semibold text-text-muted hover:text-foreground border border-border rounded-xs px-2 py-0.5 transition-colors focus-visible:outline-primary"
                  >
                    {isActive ? `[ ${text.activeLabel} ]` : text.previewLabel}
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  {project.title}
                </h3>

                {/* Summary */}
                <p className="text-xs sm:text-sm leading-relaxed text-text-secondary mt-1.5 mb-3.5">
                  {project.summary}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-4" aria-label={text.techAriaLabel}>
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded-xs bg-surface-muted border border-border text-[11px] font-mono text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Independent crawlable navigation link */}
                <Link
                  href={project.href}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-foreground hover:text-accent group"
                >
                  <span>{text.readCase}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  <span className="sr-only"> — {project.title}</span>
                </Link>

                {/* Mobile linear preview: displayed directly beneath project card on < 768px */}
                <div className="mt-4 md:hidden border-t border-border pt-4">
                  {renderPreviewContent(project.id, text)}
                </div>
              </article>
            );
          })}
        </div>

        {/* Right Column: Desktop Sticky Preview Card (hidden on mobile) */}
        <div className="hidden md:block md:col-span-6 lg:col-span-6 sticky top-20">
          <div className="p-5 lg:p-6 rounded-xs border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-mono text-text-muted">
              <span>{"// ARCHITECTURE_PREVIEW"}</span>
              <span className="font-semibold text-foreground">[{activeCounter}]</span>
            </div>

            <div className="min-h-[340px] flex flex-col justify-center">
              {renderPreviewContent(activeId, text)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderPreviewContent(id: string, text: ReturnType<typeof getPersonalContent>) {
  if (id === "ai-review-platform") {
    return (
      <div className="p-4 sm:p-5 rounded-xs bg-surface-card border border-border space-y-4 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-secondary uppercase tracking-wider text-[11px]">
            {"// WORKBENCH_PLATFORM"}
          </span>
          <span className="px-2 py-0.5 rounded-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
            ● PRODUCTION_SLICE
          </span>
        </div>
        <p className="text-sm font-sans font-semibold text-foreground">
          Human-in-the-Loop Document Verification Flow
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xs bg-surface border border-border">
            <span className="text-text-secondary block font-bold text-[10px]">01. INGEST</span>
            <span className="text-text-muted text-[11px]">PDF & Markdown parsing</span>
          </div>
          <div className="p-2.5 rounded-xs bg-surface border border-border">
            <span className="text-text-secondary block font-bold text-[10px]">02. MAP</span>
            <span className="text-text-muted text-[11px]">Model field extraction</span>
          </div>
          <div className="p-2.5 rounded-xs bg-surface border border-border">
            <span className="text-text-secondary block font-bold text-[10px]">03. REVIEW</span>
            <span className="text-text-muted text-[11px]">Optimistic lock (HTTP 409)</span>
          </div>
          <div className="p-2.5 rounded-xs bg-surface border border-border">
            <span className="text-text-secondary block font-bold text-[10px]">04. EXPORT</span>
            <span className="text-text-muted text-[11px]">Audit-logged Excel / CSV</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span>800+ test suite (project)</span>
          <span>Python / FastAPI</span>
        </div>
      </div>
    );
  }

  if (id === "pocket-rag") {
    return (
      <div className="p-4 sm:p-5 rounded-xs bg-surface-card border border-border space-y-4 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-secondary uppercase tracking-wider text-[11px]">
            {"// POCKET_RAG_QUERY"}
          </span>
          <span className="px-2 py-0.5 rounded-xs bg-surface-muted border border-border text-text-muted text-[10px]">
            {text.previewSampleBadge}
          </span>
        </div>
        <div className="p-3 rounded-xs bg-surface border border-border text-xs space-y-1.5">
          <p className="font-medium text-foreground font-sans">
            {text.pocketRagQuery.question}
          </p>
          <p className="text-text-muted text-[11px]">
            {text.pocketRagQuery.sourcesLabel}: <span className="text-foreground">[Doc: mietvertrag_beispiel.pdf §4]</span>
          </p>
        </div>
        <div className="p-3 rounded-xs bg-surface/70 border border-border text-xs text-text-secondary leading-relaxed font-sans">
          {text.pocketRagQuery.answer}
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span>Local SQLite Vectors</span>
          <span>5 German Sample PDFs</span>
        </div>
      </div>
    );
  }

  if (id === "agent-workspace") {
    return (
      <div className="p-4 sm:p-5 rounded-xs bg-surface-card border border-border space-y-4 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-secondary uppercase tracking-wider text-[11px]">
            {"// AGENT_SESSION"}
          </span>
          <span className="px-2 py-0.5 rounded-xs bg-surface-muted border border-border text-text-muted text-[10px]">
            {text.previewSampleBadge}
          </span>
        </div>
        <div className="p-3 rounded-xs bg-surface border border-border text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>{"tool_call: list_tasks({ status: \"pending\" })"}</span>
          </div>
          <div className="p-2 rounded-xs bg-surface-muted text-[11px] text-text-secondary">
            → [TASK-102] {text.agentWorkspaceDemo.taskLabel}
          </div>
        </div>
        <div className="p-3 rounded-xs bg-surface/70 border border-border text-xs text-text-secondary leading-relaxed flex items-start gap-2 font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>{text.agentWorkspaceDemo.streamStatus}</span>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span>{text.agentWorkspaceDemo.offlineProvider}</span>
          <span>MCP 2026 Compatible</span>
        </div>
      </div>
    );
  }

  return null;
}
