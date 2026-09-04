"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary, Locale, getLocalizedPath } from "@/lib/i18n";

function getLocaleFromPath(pathname: string): Locale {
  if (pathname === "/pt" || pathname.startsWith("/pt/")) return "pt";
  if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  return "en";
}

export function Footer() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPath(pathname);
  const dict = getDictionary(locale);

  return (
    <footer className="border-t border-border bg-surface/50 py-8 mt-20 text-text-muted text-xs transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-center sm:text-left">{dict.footer.copyright}</p>
        <div className="flex items-center gap-4 text-text-secondary">
          <Link
            href={getLocalizedPath("/about", locale)}
            className="hover:text-primary transition-colors"
          >
            {dict.footer.about}
          </Link>
          <span className="text-border" aria-hidden="true">•</span>
          <a
            href="https://github.com/Rodnorm/ai-engineer-roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {dict.footer.githubRepo}
          </a>
          <span className="text-border" aria-hidden="true">•</span>
          <a
            href="https://www.linkedin.com/in/rodnorm/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {dict.footer.linkedinProfile}
          </a>
        </div>
      </div>
    </footer>
  );
}
