import { CatalogPageView } from "@/components/views/CatalogPageView";
import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: `${getDictionary("en").catalog.title} — ${getDictionary("en").meta.siteTitle}`,
  description: getDictionary("en").catalog.subtitle,
};

export default function AppsPage() {
  return <CatalogPageView locale="en" />;
}
