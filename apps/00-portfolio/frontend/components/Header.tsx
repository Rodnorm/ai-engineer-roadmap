"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Code2, BriefcaseBusiness, User } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
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
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-border bg-surface/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-6xl min-w-0 items-center justify-between gap-1 px-3 sm:gap-4 sm:px-6">
        <Link
          href={getLocalizedPath("/", locale)}
          className="flex min-w-0 flex-shrink items-center gap-2 font-bold tracking-tight text-foreground transition-colors hover:text-primary sm:text-lg"
          aria-label="Rodrigo Normando"
        >
          <Sparkles className="h-5 w-5 flex-shrink-0 text-primary" />
          <span className="hidden min-w-0 truncate sm:inline sm:max-w-32 lg:max-w-none">Rodrigo Normando</span>
        </Link>
        <nav className="flex min-w-0 items-center justify-end gap-0.5 text-sm font-medium text-text-secondary sm:gap-2 md:gap-4">
          <Link
            href={getLocalizedPath("/apps", locale)}
            className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:text-primary sm:px-2"
            aria-label={dict.nav.catalog}
          >
            <Code2 className="h-4 w-4" />
            <span className="hidden sm:inline">{dict.nav.catalog}</span>
          </Link>
          <Link
            href={getLocalizedPath("/experience", locale)}
            className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:text-primary sm:px-2"
            aria-label={dict.nav.experience}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            <span className="hidden sm:inline">{dict.nav.experience}</span>
          </Link>
          <Link
            href={getLocalizedPath("/about", locale)}
            className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:text-primary sm:px-2"
            aria-label={dict.nav.about}
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{dict.nav.about}</span>
          </Link>
          <LanguageSelector />
          <ThemeToggle />
          <a
            href="https://github.com/Rodnorm"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary lg:inline-flex"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

