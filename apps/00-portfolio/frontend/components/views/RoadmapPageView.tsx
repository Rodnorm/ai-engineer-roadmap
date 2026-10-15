import Link from "next/link";
import { getAppCatalog } from "@/lib/catalog";
import { getDictionary, getLocalizedPath, type Locale } from "@/lib/i18n";

export function RoadmapPageView({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const apps = getAppCatalog(locale);
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <header className="space-y-3"><h1 className="text-3xl font-extrabold">{dict.roadmap.title}</h1><p className="leading-relaxed text-text-muted">{dict.roadmap.subtitle}</p></header>
      <ol className="space-y-5 border-l-2 border-border pl-5 sm:pl-8">
        {apps.map((app) => (
          <li key={app.id} className="rounded-2xl border border-border bg-surface p-6 space-y-3">
            <p className="text-sm text-primary font-semibold">{dict.home.appBadge} {app.id} · {app.category}</p>
            <h2 className="text-xl font-bold">{app.title}</h2>
            <p className="text-text-secondary leading-relaxed">{app.description}</p>
            <Link href={getLocalizedPath(`/apps/${app.slug}`, locale)} className="inline-block text-sm font-semibold text-primary hover:underline">{dict.roadmap.viewDetails}<span className="sr-only"> — {app.title}</span></Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
