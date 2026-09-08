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
    "Azure OpenAI & Visão Multimodal",
    "Sanitização de PII & Mascaramento de Dados",
    "Azure Content Safety & Moderação Prévia",
    "Server-Sent Events (SSE) Streaming",
    "Prevenção de Prompt Injection (XML Tags)",
    "RAG Local & Embeddings Vetoriais",
    "FastAPI, Pydantic V2 & Next.js App Router",
    "Segurança Defensiva, Rate Limiting & CI",
  ],
  en: [
    "Production Hardened AI Engineering",
    "Azure OpenAI & Multi-Modal Vision",
    "PII Sanitization & Data Masking",
    "Azure Content Safety & Pre-Moderation",
    "Server-Sent Events (SSE) Streaming",
    "Prompt Injection Defense (XML Tags)",
    "Local RAG & Vector Embeddings",
    "FastAPI, Pydantic V2 & Next.js App Router",
    "Defensive Security, Rate Limiting & CI",
  ],
  de: [
    "Produktionsreife KI-Entwicklung",
    "Azure OpenAI & Multimodale Bildanalyse",
    "PII-Bereinigung & Datenschutzmaskierung",
    "Azure Content Safety & Vorabmoderation",
    "Server-Sent Events (SSE) Streaming",
    "Prompt-Injection-Schutz (XML-Tags)",
    "Lokales RAG & Vektor-Embeddings",
    "FastAPI, Pydantic V2 & Next.js App Router",
    "Defensive Sicherheit, Rate Limiting & CI",
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
