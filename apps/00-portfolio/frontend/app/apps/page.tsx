import Link from "next/link";
import { getAppCatalog } from "@/lib/catalog";
import { ExternalLink, BookOpen, ShieldCheck } from "lucide-react";

export default function AppsPage() {
  const apps = getAppCatalog();

  return (
    <div className="space-y-8 py-4">
      <div className="border-b border-border/80 pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Application Catalog</h1>
        <p className="text-slate-400 text-sm">
          Monorepo applications built, security-hardened, and documented as part of the AI Engineering roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app) => (
          <div key={app.id} className="rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium">
                  App {app.id} — {app.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold capitalize">
                  {app.status}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{app.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{app.summary}</p>
              
              <div className="space-y-2 pt-2">
                <div className="text-xs text-slate-400 font-semibold">Tech Stack:</div>
                <div className="flex flex-wrap gap-1.5">
                  {app.technologies.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {app.security && (
                <div className="flex items-center gap-3 pt-2 text-xs text-emerald-400/90 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Rate limited • No user content stored • Public demo</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border/50 text-xs font-semibold">
              <Link
                href={`/apps/${app.slug}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-surface border border-border hover:border-primary text-center text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Case Study</span>
              </Link>
              <a
                href={app.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
