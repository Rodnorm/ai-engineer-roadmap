"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDictionary, getLocalizedPath, getLocaleFromPath } from "@/lib/i18n";
import { LINKEDIN_URL } from "@/lib/personal-content";

export function Header() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPath(pathname);
  const dict = getDictionary(locale);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-border bg-background/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-6xl min-w-0 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href={getLocalizedPath("/", locale)}
          className="flex min-w-0 flex-shrink-0 items-center gap-2 font-bold tracking-tight text-foreground transition-colors hover:text-primary group"
          aria-label="Rodrigo Normando"
        >
          <span className="font-serif font-black text-xl text-foreground group-hover:text-primary transition-colors">
            RN
          </span>
          <span className="text-text-muted font-light hidden sm:inline" aria-hidden="true">
            /
          </span>
          <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate hidden sm:inline">
            Rodrigo Normando
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex min-w-0 items-center justify-end gap-1 text-sm font-medium text-text-secondary md:gap-3 lg:gap-4">
          <Link
            href={getLocalizedPath("/apps", locale)}
            className="rounded-lg px-2.5 py-1.5 transition-colors hover:text-primary hover:bg-surface/60 font-semibold"
          >
            {dict.nav.catalog}
          </Link>
          <Link
            href={getLocalizedPath("/experience", locale)}
            className="rounded-lg px-2.5 py-1.5 transition-colors hover:text-primary hover:bg-surface/60 font-semibold"
          >
            {dict.nav.experience}
          </Link>
          <Link
            href={getLocalizedPath("/about", locale)}
            className="rounded-lg px-2.5 py-1.5 transition-colors hover:text-primary hover:bg-surface/60 font-semibold"
          >
            {dict.nav.about}
          </Link>

          {/* Contact Pill */}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 rounded-full border border-primary/50 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white dark:hover:text-background transition-all"
            aria-label={`${dict.nav.contact} on LinkedIn`}
          >
            <span>{dict.nav.contact}</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>

          <div className="flex items-center gap-1 border-l border-border pl-2 sm:pl-3">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Controls & Hamburger */}
        <div className="flex md:hidden items-center gap-1.5">
          <LanguageSelector />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-text-secondary hover:text-foreground hover:bg-surface transition-colors focus-visible:outline-primary"
          >
            {isMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 space-y-1 animate-in fade-in-50 slide-in-from-top-2 duration-150"
        >
          <Link
            href={getLocalizedPath("/apps", locale)}
            onClick={() => setIsMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary hover:text-primary hover:bg-surface/60 transition-colors"
          >
            {dict.nav.catalog}
          </Link>
          <Link
            href={getLocalizedPath("/experience", locale)}
            onClick={() => setIsMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary hover:text-primary hover:bg-surface/60 transition-colors"
          >
            {dict.nav.experience}
          </Link>
          <Link
            href={getLocalizedPath("/about", locale)}
            onClick={() => setIsMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary hover:text-primary hover:bg-surface/60 transition-colors"
          >
            {dict.nav.about}
          </Link>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-surface/60 transition-colors"
          >
            <span>{dict.nav.contact}</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </nav>
      )}
    </header>
  );
}
