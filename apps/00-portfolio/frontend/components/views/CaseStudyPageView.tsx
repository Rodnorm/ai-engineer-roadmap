import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppBySlug, getCaseStudyContent } from "@/lib/catalog";
import { getDictionary, Locale, getLocalizedPath } from "@/lib/i18n";
import { ArrowLeft, ExternalLink, ShieldCheck, Info } from "lucide-react";

export function CaseStudyPageView({ slug, locale = "en" }: { slug: string; locale?: Locale }) {
  const dict = getDictionary(locale);
  const app = getAppBySlug(slug, locale);

  if (!app) {
    notFound();
  }

  const { content, isFallback } = getCaseStudyContent(app.caseStudyPath, locale);

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      <Link
        href={getLocalizedPath("/apps", locale)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{dict.caseStudy.backToCatalog}</span>
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary text-xs font-mono font-medium">
                {dict.home.appBadge} {app.id}
              </span>
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider font-mono">
                {app.category}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-foreground">
              {app.title}
            </h1>
          </div>
          {app.liveUrl && (
            <a
              href={app.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-primary text-white dark:text-background font-semibold hover:bg-primary-hover transition-all flex items-center gap-2 text-sm shadow-sm"
            >
              <span>{dict.caseStudy.launchLiveDemo}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
          {app.summary}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
          {app.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-lg bg-surface-muted border border-border text-text-secondary text-xs font-mono"
            >
              {tech}
            </span>
          ))}
        </div>

        {app.security && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 font-medium">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{dict.caseStudy.securityBanner}</span>
          </div>
        )}
      </div>

      {isFallback && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{dict.caseStudy.englishFallbackNotice}</span>
        </div>
      )}

      <article className="p-6 sm:p-10 rounded-3xl bg-surface border border-border text-text-secondary shadow-sm">
        <div className="whitespace-pre-wrap font-sans text-text-secondary space-y-4 leading-relaxed text-base">
          {content}
        </div>
      </article>
    </div>
  );
}
