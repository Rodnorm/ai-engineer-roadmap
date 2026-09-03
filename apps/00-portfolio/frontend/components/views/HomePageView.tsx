import Link from "next/link";
import { getAppCatalog } from "@/lib/catalog";
import { getDictionary, Locale, getLocalizedPath } from "@/lib/i18n";
import { ArrowRight, ShieldCheck, Cpu, Zap, Lock, ExternalLink, BookOpen } from "lucide-react";

export function HomePageView({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const apps = getAppCatalog(locale);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{dict.home.badge}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          {dict.home.heroTitlePrefix}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            {dict.home.heroTitleHighlight}
          </span>
        </h1>
        <p className="text-text-muted text-base sm:text-lg leading-relaxed">
          {dict.home.heroSubtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href={getLocalizedPath("/apps", locale)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-sm"
          >
            <span>{dict.home.ctaExploreCatalog}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={getLocalizedPath("/roadmap", locale)}
            className="px-5 py-2.5 rounded-xl bg-surface border border-border hover:border-text-secondary text-foreground font-semibold transition-all text-sm shadow-sm"
          >
            {dict.home.ctaViewRoadmap}
          </Link>
        </div>
      </section>

      {/* Stack & Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="p-2.5 rounded-xl bg-primary/10 w-fit text-primary mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{dict.home.highlight1Title}</h3>
          <p className="text-text-muted text-sm">
            {dict.home.highlight1Desc}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="p-2.5 rounded-xl bg-accent/10 w-fit text-accent mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{dict.home.highlight2Title}</h3>
          <p className="text-text-muted text-sm">
            {dict.home.highlight2Desc}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 w-fit text-emerald-600 dark:text-emerald-400 mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{dict.home.highlight3Title}</h3>
          <p className="text-text-muted text-sm">
            {dict.home.highlight3Desc}
          </p>
        </div>
      </section>

      {/* Featured Projects Catalog */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{dict.home.featuredTitle}</h2>
            <p className="text-text-muted text-sm">{dict.home.featuredSubtitle}</p>
          </div>
          <Link
            href={getLocalizedPath("/apps", locale)}
            className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
          >
            {dict.home.viewAll} ({apps.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all p-6 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary text-xs font-mono font-medium">
                    {dict.home.appBadge} {app.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold capitalize">
                    {app.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{app.title}</h3>
                <p className="text-text-muted text-sm line-clamp-3">{app.summary}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {app.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 rounded bg-surface-muted border border-border text-text-secondary text-xs font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border text-xs font-semibold">
                <Link
                  href={getLocalizedPath(`/apps/${app.slug}`, locale)}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface border border-border hover:border-primary text-center text-text-secondary hover:text-foreground transition-all flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{dict.home.caseStudyBtn}</span>
                </Link>
                <a
                  href={app.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>{dict.home.demoBtn}</span>
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
