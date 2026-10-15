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
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground">
          {dict.catalog.title}
        </h1>
        <p className="text-text-muted text-sm sm:text-base max-w-2xl">{dict.catalog.subtitle}</p>
      </div>

      <aside className="rounded-2xl border border-primary/40 bg-surface p-5 sm:p-6 space-y-3">
        <p className="text-sm text-text-secondary leading-relaxed">{text.projectNote}</p>
        <Link
          href={getLocalizedPath(PROFESSIONAL_CASE_PATH, locale)}
          className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
        >
          {text.professionalLabel}: {text.caseTitle} →
        </Link>
      </aside>

      {apps.length === 0 ? (
        <div className="p-8 text-center text-text-muted text-sm rounded-2xl bg-surface border border-border">
          {dict.catalog.emptyNotice}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary text-xs font-mono font-medium">
                    {dict.home.appBadge} {app.id} — {app.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold capitalize">
                    {app.status}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-foreground">{app.title}</h2>
                <p className="text-text-muted text-sm leading-relaxed">{app.summary}</p>

                <div className="space-y-2 pt-2">
                  <div className="text-xs text-text-muted font-semibold uppercase tracking-wider font-mono">
                    {dict.catalog.techStack}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {app.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-surface-muted border border-border text-text-secondary text-xs font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {app.security && (
                  <div className="flex items-center gap-2 pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>{dict.catalog.securityBadge}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border text-xs font-semibold">
                <Link
                  href={getLocalizedPath(`/apps/${app.slug}`, locale)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-surface border border-border hover:border-primary text-center text-text-secondary hover:text-foreground transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{dict.catalog.readCaseStudyBtn}</span>
                </Link>
                {app.liveUrl && (
                  <a
                    href={app.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{dict.catalog.liveDemoBtn}</span>
                    <ExternalLink className="w-4 h-4" />
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
