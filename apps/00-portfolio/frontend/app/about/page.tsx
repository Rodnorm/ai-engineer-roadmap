import Link from "next/link";
import { ArrowLeft, Linkedin, Github, Cpu, ShieldCheck, Code2, Sparkles, Terminal, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "About Rodrigo Norman — AI Engineer",
  description: "Learn more about Rodrigo Norman's professional background, skills, and AI engineering roadmap transition.",
};

export default function AboutPage() {
  const highlights = [
    {
      title: "Senior Full-Stack & Frontend Background",
      description: "Extensive background crafting scalable, highly performant web applications, modern design systems, and responsive user experiences.",
    },
    {
      title: "AI Engineering & Azure Cloud Integration",
      description: "Practical expertise building production-ready AI applications using Azure OpenAI, Azure AI Language, Content Safety, and Agent frameworks.",
    },
    {
      title: "Production Security & Cost Governance",
      description: "Obsessed with defensive AI architecture: multi-tier rate limiting, kill switches, PII masking, input isolation tags, and EXIF stripping.",
    },
  ];

  const skillGroups = [
    {
      category: "AI & Machine Learning",
      skills: ["Azure OpenAI API", "Azure AI Foundry", "Azure AI Language", "Azure Content Safety", "RAG & Vector Search", "Prompt Engineering", "Structured Outputs"],
    },
    {
      category: "Backend & Systems",
      skills: ["Python 3.12", "FastAPI", "Pydantic V2", "REST & SSE Streaming", "Asyncio & Concurrency", "Docker & Vercel"],
    },
    {
      category: "Frontend Architecture",
      skills: ["Next.js (App Router)", "React 18", "TypeScript", "Tailwind CSS", "State Management", "Performance Optimization"],
    },
    {
      category: "Security & DevOps",
      skills: ["Rate Limiting & Cost Guards", "PII Sanitization & Privacy", "Gitleaks & CodeQL", "GitHub Actions CI/CD", "Monorepo Management"],
    },
  ];

  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Profile Header */}
      <section className="p-8 rounded-3xl bg-surface border border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Engineer & Software Architect</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Rodrigo Norman</h1>
            <p className="text-slate-400 text-sm font-medium">Senior Software Engineer • Transitioning to AI Engineering</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/rodnorm/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/30 text-[#0a66c2] hover:bg-[#0a66c2]/20 font-semibold transition-all flex items-center gap-2 text-xs"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/Rodnorm/ai-engineer-roadmap"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white hover:border-slate-500 font-semibold transition-all flex items-center gap-2 text-xs"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <p className="text-slate-300 text-base leading-relaxed border-t border-border/60 pt-6">
          Experienced Senior Software Engineer specializing in frontend architecture and full-stack web applications, currently advancing through an intensive, hands-on roadmap to master AI Engineering. Focused on building real-world AI software that balances user experience with rigorous security, privacy protections, and cloud cost control.
        </p>
      </section>

      {/* Professional Highlights */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Core Engineering Principles</h2>
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
        <h2 className="text-2xl font-bold text-white">Technical Skills & Expertise</h2>
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
        <h2 className="text-2xl font-bold text-white">About the AI Engineering Roadmap</h2>
        <p>
          The <strong>AI Engineer Roadmap</strong> is a structured project initiated to systematically master modern AI engineering workflows. Rather than focusing solely on raw model prompts or prototype scripts, this repository demonstrates how to build production-grade software around generative AI models.
        </p>
        <p>
          Every application in the monorepo incorporates end-to-end delivery principles: solution design, responsive frontend interfaces, FastAPI microservice backends, automated unit testing, rate limiting, and zero-trust security boundaries.
        </p>
      </section>
    </div>
  );
}
