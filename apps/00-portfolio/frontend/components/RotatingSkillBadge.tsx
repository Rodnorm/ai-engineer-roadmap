"use client";

import { useEffect, useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Locale } from "@/lib/i18n";

interface RotatingSkillBadgeProps {
  locale?: Locale;
}

const SKILLS_BY_LOCALE: Record<Locale, string[]> = {
  pt: [
    "Engenharia de IA para Produção",
    "Arquitetura de Soluções Enterprise",
    "Azure OpenAI & Visão Multimodal",
    "Sanitização de PII & Conformidade de Dados",
    "Azure Content Safety & Moderação Prévia",
    "Server-Sent Events (SSE) Streaming",
    "Defesa contra Prompt Injection (XML Guardrails)",
    "RAG Corporativo & Embeddings Vetoriais",
    "Sistemas Multi-Agente & Orquestração",
    "AIOps, Rollouts Canário & Telemetria OTel",
    "FastAPI, Pydantic V2 & Next.js App Router",
  ],
  en: [
    "Production Hardened AI Engineering",
    "Enterprise AI Solutions Architecture",
    "Azure OpenAI & Multi-Modal Vision",
    "PII Sanitization & Data Compliance",
    "Azure Content Safety & Pre-Moderation",
    "Server-Sent Events (SSE) Streaming",
    "Prompt Injection Defense (XML Guardrails)",
    "Enterprise RAG & Vector Embeddings",
    "Multi-Agent Systems & Orchestration",
    "AIOps, Canary Rollouts & OTel Telemetry",
    "FastAPI, Pydantic V2 & Next.js App Router",
  ],
  de: [
    "Produktionsreife KI-Entwicklung",
    "Enterprise KI-Lösungsarchitektur",
    "Azure OpenAI & Multimodale Bildanalyse",
    "PII-Bereinigung & Datenschutz-Compliance",
    "Azure Content Safety & Vorabmoderation",
    "Server-Sent Events (SSE) Streaming",
    "Prompt-Injection-Schutz (XML-Guardrails)",
    "Enterprise RAG & Vektor-Embeddings",
    "Multi-Agenten-Systeme & Orchestrierung",
    "AIOps, Canary-Rollouts & OTel-Telemetrie",
    "FastAPI, Pydantic V2 & Next.js App Router",
  ],
};

export function RotatingSkillBadge({ locale = "en" }: RotatingSkillBadgeProps) {
  const baseSkills = useMemo(() => SKILLS_BY_LOCALE[locale] || SKILLS_BY_LOCALE.en, [locale]);
  // Duplicate first item at end for infinite seamless vertical sliding
  const skills = useMemo(() => [...baseSkills, baseSkills[0]], [baseSkills]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    setCurrentIndex(0);
    setIsTransitioning(true);
  }, [locale]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 2800);

    return () => clearInterval(interval);
  }, [skills.length]);

  useEffect(() => {
    if (currentIndex === baseSkills.length) {
      const resetTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 550);

      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, baseSkills.length]);

  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-sm"
      role="region"
      aria-label="Mastered skills and concepts"
    >
      <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 animate-pulse" aria-hidden="true" />
      <div className="h-5 overflow-hidden relative">
        <div
          className={`flex flex-col text-left ${
            isTransitioning ? "transition-transform duration-500 ease-out" : "transition-none"
          }`}
          style={{ transform: `translateY(-${currentIndex * 20}px)` }}
        >
          {skills.map((skill, idx) => (
            <span
              key={`${skill}-${idx}`}
              className="h-5 flex items-center whitespace-nowrap leading-none tracking-tight"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
