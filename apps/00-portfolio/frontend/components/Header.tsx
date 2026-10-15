"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDictionary, Locale, getLocalizedPath } from "@/lib/i18n";
import { LINKEDIN_URL } from "@/lib/personal-content";

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
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-border bg-background/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-6xl min-w-0 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href={getLocalizedPath("/", locale)}
          className="flex min-w-0 flex-shrink items-center gap-2 font-bold tracking-tight text-foreground transition-colors hover:text-primary group"
          aria-label="Rodrigo Normando"
        >
          <span className="font-serif font-black text-xl text-foreground group-hover:text-primary transition-colors">
            RN
          </span>
          <span className="text-text-muted font-light" aria-hidden="true">
            /
          </span>
          <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            Rodrigo Normando
          </span>
        </Link>

        <nav className="flex min-w-0 items-center justify-end gap-1 text-xs sm:text-sm font-medium text-text-secondary sm:gap-3 md:gap-4">
          <Link
            href={getLocalizedPath("/apps", locale)}
            className="rounded-lg px-2 py-1.5 transition-colors hover:text-primary hover:bg-surface/60 font-semibold"
          >
            {dict.nav.catalog}
          </Link>
          <Link
            href={getLocalizedPath("/experience", locale)}
            className="rounded-lg px-2 py-1.5 transition-colors hover:text-primary hover:bg-surface/60 font-semibold"
          >
            {dict.nav.experience}
          </Link>
          <Link
            href={getLocalizedPath("/about", locale)}
            className="rounded-lg px-2 py-1.5 transition-colors hover:text-primary hover:bg-surface/60 font-semibold"
          >
            {dict.nav.about}
          </Link>

          {/* Contact Pill */}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-primary/50 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white dark:hover:text-background transition-all"
            aria-label="Contact on LinkedIn"
          >
            <span>Contact</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>

          <div className="flex items-center gap-1 border-l border-border pl-2 sm:pl-3">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
