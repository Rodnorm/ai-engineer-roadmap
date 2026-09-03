import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppBySlug, getAppCatalog, getCaseStudyContent } from "@/lib/catalog";
import { ArrowLeft, ExternalLink, ShieldCheck, Cpu } from "lucide-react";

export function generateStaticParams() {
  const apps = getAppCatalog();
  return apps.map((app) => ({
    slug: app.slug,
  }));
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const app = getAppBySlug(params.slug);
  if (!app) {
    notFound();
  }

  const content = getCaseStudyContent(app.caseStudyPath);

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      <Link href="/apps" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>

      <div className="p-8 rounded-3xl bg-surface border border-border space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium">
                App {app.id}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{app.category}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{app.title}</h1>
          </div>
          <a
            href={app.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-primary/90 transition-all flex items-center gap-2 text-sm"
          >
            <span>Launch Live Demo</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <p className="text-slate-300 text-base leading-relaxed">{app.summary}</p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          {app.technologies.map((tech) => (
            <span key={tech} className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
              {tech}
            </span>
          ))}
        </div>

        {app.security && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              Security Hardened: Rate-limited, concurrency capped, EXIF & PII sanitized, zero client secrets.
            </span>
          </div>
        )}
      </div>

      <article className="prose prose-invert max-w-none p-8 rounded-3xl bg-surface/50 border border-border/80 text-slate-300 space-y-6">
        <div className="whitespace-pre-wrap font-sans text-slate-300 space-y-4 leading-relaxed">
          {content}
        </div>
      </article>
    </div>
  );
}
