import { getAppCatalog, getAppBySlug } from "@/lib/catalog";
import { CaseStudyPageView } from "@/components/views/CaseStudyPageView";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const apps = getAppCatalog("en");
  return apps.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const app = getAppBySlug(slug, "en");
  if (!app) return {};

  return {
    title: `${app.title} Case Study — ${getDictionary("en").meta.siteTitle}`,
    description: app.summary,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const app = getAppBySlug(slug, "en");
  if (!app) {
    notFound();
  }

  return <CaseStudyPageView slug={slug} locale="en" />;
}
