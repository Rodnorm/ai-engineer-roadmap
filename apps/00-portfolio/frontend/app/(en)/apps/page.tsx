import { CatalogPageView } from "@/components/views/CatalogPageView";
import { getDictionary, getRouteAlternates } from "@/lib/i18n";

const dict = getDictionary("en");
const alternates = getRouteAlternates("/apps", "en");

export const metadata = {
  title: `${dict.catalog.title} — ${dict.meta.siteTitle}`,
  description: dict.catalog.subtitle,
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
  },
};

export default function AppsPage() {
  return <CatalogPageView locale="en" />;
}
