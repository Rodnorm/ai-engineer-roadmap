import Link from "next/link";
import { getAppCatalog } from "@/lib/catalog";
import { ArrowRight, ShieldCheck, Cpu, Zap, Lock, ExternalLink, BookOpen } from "lucide-react";

export default function HomePage() {
  const apps = getAppCatalog();

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Production Hardened AI Engineering</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Transitioning from Senior Engineer to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI Engineer</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          An incremental hands-on roadmap building, securing, and scaling production-grade AI applications on Azure OpenAI, FastAPI, and Next.js.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/apps"
            className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-sm"
          >
            <span>Explore App Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/roadmap"
            className="px-5 py-2.5 rounded-xl bg-surface border border-border hover:border-slate-500 text-white font-semibold transition-all text-sm"
          >
            View Roadmap Progression
          </Link>
        </div>
      </section>

      {/* Stack & Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface/50 border border-border/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-primary/10 w-fit text-primary mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Azure AI Ecosystem</h3>
          <p className="text-slate-400 text-sm">
            Leveraging Azure OpenAI, Azure AI Language, Azure Content Safety, and Azure AI Agents SDKs.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-surface/50 border border-border/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-accent/10 w-fit text-accent mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Security Hardened</h3>
          <p className="text-slate-400 text-sm">
            Rate limiting, kill switches, PII data masking, EXIF metadata stripping, and prompt injection bounds.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-surface/50 border border-border/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 w-fit text-emerald-400 mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Cost & Abuse Guardrails</h3>
          <p className="text-slate-400 text-sm">
            Strict token output limits, concurrency semaphores, and distributed per-client IP quotas.
          </p>
        </div>
      </section>

      {/* Featured Projects Catalog */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Applications</h2>
            <p className="text-slate-400 text-sm">Production-ready AI applications built incrementally</p>
          </div>
          <Link href="/apps" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
            View All ({apps.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium">
                    App {app.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold capitalize">
                    {app.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{app.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-3">{app.summary}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {app.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50 text-xs font-semibold">
                <Link
                  href={`/apps/${app.slug}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface border border-border hover:border-primary text-center text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Case Study</span>
                </Link>
                <a
                  href={app.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
