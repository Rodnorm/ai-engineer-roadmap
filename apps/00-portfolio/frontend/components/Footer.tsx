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
    <footer className="border-t border-border/80 bg-surface/30 py-8 mt-20 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>{dict.footer.copyright}</p>
        <div className="flex items-center gap-4">
          <Link
            href={getLocalizedPath("/about", locale)}
            className="hover:text-primary transition-colors"
          >
            {dict.footer.about}
          </Link>
          <span>•</span>
          <a
            href="https://github.com/Rodnorm/ai-engineer-roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {dict.footer.githubRepo}
          </a>
          <span>•</span>
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
