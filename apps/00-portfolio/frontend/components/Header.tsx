"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Code2, Map, User } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { getDictionary, Locale, getLocalizedPath } from "@/lib/i18n";

function getLocaleFromPath(pathname: string): Locale {
  if (pathname === "/pt" || pathname.startsWith("/pt/")) return "pt";
  if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  return "en";
}

export function Header() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPath(pathname);
  const dict = getDictionary(locale);

  return (
    <header className="border-b border-border/80 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href={getLocalizedPath("/", locale)}
          className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-white hover:text-primary transition-colors flex-shrink-0"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <span>AI Engineer Roadmap</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium text-slate-300">
          <Link
            href={getLocalizedPath("/apps", locale)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.nav.catalog}</span>
          </Link>
          <Link
            href={getLocalizedPath("/roadmap", locale)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.nav.roadmap}</span>
          </Link>
          <Link
            href={getLocalizedPath("/about", locale)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.nav.about}</span>
          </Link>
          <LanguageSelector />
          <a
            href="https://github.com/Rodnorm/ai-engineer-roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex px-3.5 py-1.5 rounded-lg bg-surface border border-border hover:border-primary text-white transition-all text-xs font-semibold"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
