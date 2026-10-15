import { CatalogPageView } from "@/components/views/CatalogPageView";
import { getDictionary, createPageMetadata } from "@/lib/i18n";

const dict = getDictionary("en");

export const metadata = createPageMetadata({
  title: `${dict.catalog.title} — ${dict.meta.siteTitle}`,
  description: dict.catalog.subtitle,
  pathname: "/apps",
  locale: "en",
});

export default function AppsPage() {
  return <CatalogPageView locale="en" />;
}
