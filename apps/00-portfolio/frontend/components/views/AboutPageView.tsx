import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Linkedin, Github, Sparkles, CheckCircle2 } from "lucide-react";
import { getDictionary, Locale, getLocalizedPath } from "@/lib/i18n";

export function AboutPageView({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);

  const highlights = [
    {
      title: dict.about.principle1Title,
      description: dict.about.principle1Desc,
    },
    {
      title: dict.about.principle2Title,
      description: dict.about.principle2Desc,
    },
    {
      title: dict.about.principle3Title,
      description: dict.about.principle3Desc,
    },
  ];

  const skillGroups = [
    {
      category: locale === "pt" ? "IA & Machine Learning" : locale === "de" ? "KI & Machine Learning" : "AI & Machine Learning",
      skills: ["Azure OpenAI API", "Azure AI Foundry", "Azure AI Language", "Azure Content Safety", "RAG & Vector Search", "Prompt Engineering", "Structured Outputs"],
    },
    {
      category: locale === "pt" ? "Backend & Sistemas" : locale === "de" ? "Backend & Systeme" : "Backend & Systems",
      skills: ["Python 3.12", "FastAPI", "Pydantic V2", "REST & SSE Streaming", "Asyncio & Concurrency", "Docker & Vercel"],
    },
    {
      category: locale === "pt" ? "Arquitetura Frontend" : locale === "de" ? "Frontend-Architektur" : "Frontend Architecture",
      skills: ["Next.js (App Router)", "React 18", "TypeScript", "Tailwind CSS", "State Management", "Performance Optimization"],
    },
    {
      category: locale === "pt" ? "Segurança & DevOps" : locale === "de" ? "Sicherheit & DevOps" : "Security & DevOps",
      skills: ["Rate Limiting & Cost Guards", "PII Sanitization & Privacy", "Gitleaks & CodeQL", "GitHub Actions CI/CD", "Monorepo Management"],
    },
  ];

  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
      <Link
        href={getLocalizedPath("/", locale)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{dict.about.backToHome}</span>
      </Link>

      {/* Profile Header */}
      <section className="p-8 rounded-3xl bg-surface border border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/40 bg-slate-900 flex-shrink-0 shadow-lg shadow-primary/10">
              <Image
                src="/profile.jpg"
                alt={dict.about.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{dict.about.badge}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{dict.about.title}</h1>
              <p className="text-slate-400 text-sm font-medium">{dict.about.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <a
              href="https://www.linkedin.com/in/rodnorm/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/30 text-[#0a66c2] hover:bg-[#0a66c2]/20 font-semibold transition-all flex items-center gap-2 text-xs"
            >
              <Linkedin className="w-4 h-4" />
              <span>{dict.about.linkedin}</span>
            </a>
            <a
              href="https://github.com/Rodnorm/ai-engineer-roadmap"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white hover:border-slate-500 font-semibold transition-all flex items-center gap-2 text-xs"
            >
              <Github className="w-4 h-4" />
              <span>{dict.about.github}</span>
            </a>
          </div>
        </div>

        <p className="text-slate-300 text-base leading-relaxed border-t border-border/60 pt-6">
          {dict.about.bio}
        </p>
      </section>

      {/* Professional Highlights */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">{dict.about.principlesTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-surface/50 border border-border/80 space-y-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">{dict.about.skillsTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skillGroups.map((group, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-surface border border-border space-y-3">
              <h3 className="text-lg font-bold text-primary">{group.category}</h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap Motivation */}
      <section className="p-8 rounded-3xl bg-surface/50 border border-border/80 space-y-4 text-slate-300 text-sm leading-relaxed">
        <h2 className="text-2xl font-bold text-white">{dict.about.aboutRoadmapTitle}</h2>
        <p>{dict.about.aboutRoadmapP1}</p>
        <p>{dict.about.aboutRoadmapP2}</p>
      </section>
    </div>
  );
}
