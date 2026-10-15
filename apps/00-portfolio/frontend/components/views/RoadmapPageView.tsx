import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAppCatalog } from "@/lib/catalog";
import { getDictionary, getLocalizedPath, type Locale } from "@/lib/i18n";

export function RoadmapPageView({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const apps = getAppCatalog(locale);
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <header className="space-y-3 border-b border-border pb-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground">
          {dict.roadmap.title}
        </h1>
        <p className="leading-relaxed text-text-muted text-base sm:text-lg max-w-2xl">
          {dict.roadmap.subtitle}
        </p>
      </header>
      <ol className="space-y-6 border-l-2 border-border pl-5 sm:pl-8">
        {apps.map((app) => (
          <li
            key={app.id}
            className="rounded-2xl border border-border bg-surface p-6 sm:p-7 space-y-3 shadow-sm hover:border-primary/40 transition-colors"
          >
            <p className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              {dict.home.appBadge} {app.id} · {app.category}
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">{app.title}</h2>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">{app.description}</p>
            <div className="pt-2">
              <Link
                href={getLocalizedPath(`/apps/${app.slug}`, locale)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline group"
              >
                <span>{dict.roadmap.viewDetails}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                <span className="sr-only"> — {app.title}</span>
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
