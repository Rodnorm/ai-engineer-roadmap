import Link from "next/link";
import { getPersonalContent, PROFESSIONAL_CASE_PATH } from "@/lib/personal-content";
import { getAppCatalog } from "@/lib/catalog";
import { getDictionary, Locale, getLocalizedPath } from "@/lib/i18n";
import { ExternalLink, BookOpen, ShieldCheck } from "lucide-react";

export function CatalogPageView({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const apps = getAppCatalog(locale);
  const text = getPersonalContent(locale);

  return (
    <div className="space-y-8 py-4">
      <div className="border-b border-border pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-muted">
          <span>// CATALOG</span>
          <span className="text-border">/</span>
          <span>SYSTEM_INDEX</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground">
          {dict.catalog.title}
        </h1>
        <p className="text-text-muted text-xs sm:text-sm font-mono max-w-2xl">{dict.catalog.subtitle}</p>
      </div>

      <aside className="rounded-xs border border-border bg-surface p-5 sm:p-6 space-y-2.5 font-mono text-xs">
        <div className="flex items-center gap-2 text-text-secondary uppercase tracking-wider text-[11px] font-bold">
          <span>// SYSTEM_NOTE</span>
        </div>
        <p className="text-text-secondary leading-relaxed font-sans text-sm">{text.projectNote}</p>
        <div className="pt-1">
          <Link
            href={getLocalizedPath(PROFESSIONAL_CASE_PATH, locale)}
            className="inline-flex items-center text-xs uppercase tracking-wider font-semibold text-foreground hover:text-accent"
          >
            [ {text.professionalLabel}: {text.caseTitle} → ]
          </Link>
        </div>
      </aside>

      {apps.length === 0 ? (
        <div className="p-8 text-center text-text-muted text-xs font-mono rounded-xs bg-surface border border-border">
          {dict.catalog.emptyNotice}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {apps.map((app) => (
            <div
              key={app.id}
              className="rounded-xs bg-surface border border-border hover:border-text-muted transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3 font-mono">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-xs bg-surface-muted text-text-secondary text-[11px] border border-border font-medium">
                    [{dict.home.appBadge} {app.id} :: {app.category}]
                  </span>
                  <span className="px-2 py-0.5 rounded-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                    ● {app.status}
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">{app.title}</h2>
                <p className="text-text-muted font-sans text-xs sm:text-sm leading-relaxed">{app.summary}</p>

                <div className="space-y-1.5 pt-2 font-mono">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    {"// "}{dict.catalog.techStack}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {app.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-1.5 py-0.5 rounded-xs bg-surface-muted border border-border text-text-secondary text-[11px]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {app.security && (
                  <div className="flex items-center gap-1.5 pt-1 text-xs text-emerald-500 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>[ {dict.catalog.securityBadge} ]</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border text-xs font-mono font-semibold uppercase tracking-wider">
                <Link
                  href={getLocalizedPath(`/apps/${app.slug}`, locale)}
                  className="flex-1 py-2 px-3 rounded-xs bg-surface border border-border hover:border-text-muted text-center text-text-secondary hover:text-foreground transition-all flex items-center justify-center gap-1.5 text-[11px]"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>[ {dict.catalog.readCaseStudyBtn} ]</span>
                </Link>
                {app.liveUrl && (
                  <a
                    href={app.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xs bg-foreground text-background hover:bg-foreground/90 transition-all flex items-center justify-center gap-1 text-[11px]"
                  >
                    <span>{dict.catalog.liveDemoBtn}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
