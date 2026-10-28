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
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-border bg-background/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-6xl min-w-0 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href={getLocalizedPath("/", locale)}
          className="flex min-w-0 flex-shrink-0 items-center gap-2.5 tracking-tight text-foreground transition-colors group"
          aria-label="Rodrigo Normando"
        >
          <div className="flex flex-col">
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-foreground group-hover:text-accent transition-colors truncate">
              RODRIGO NORMANDO
            </span>
            <span className="font-mono text-[9px] tracking-widest uppercase text-text-muted hidden sm:inline">
              AI SYSTEM ARCHITECTURE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex min-w-0 items-center justify-end gap-1 text-xs font-mono font-medium text-text-secondary md:gap-2 lg:gap-3">
          <Link
            href={getLocalizedPath("/apps", locale)}
            className="rounded-xs px-2.5 py-1.5 border border-transparent hover:border-border hover:bg-surface hover:text-foreground transition-all uppercase tracking-wider"
          >
            [ {dict.nav.catalog} ]
          </Link>
          <Link
            href={getLocalizedPath("/experience", locale)}
            className="rounded-xs px-2.5 py-1.5 border border-transparent hover:border-border hover:bg-surface hover:text-foreground transition-all uppercase tracking-wider"
          >
            [ {dict.nav.experience} ]
          </Link>
          <Link
            href={getLocalizedPath("/about", locale)}
            className="rounded-xs px-2.5 py-1.5 border border-transparent hover:border-border hover:bg-surface hover:text-foreground transition-all uppercase tracking-wider"
          >
            [ {dict.nav.about} ]
          </Link>

          {/* Contact Pill */}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 rounded-xs border border-border bg-surface px-2.5 py-1 text-[11px] font-mono font-semibold text-text-secondary hover:text-foreground hover:border-text-muted transition-all uppercase tracking-wider"
            aria-label={`${dict.nav.contact} on LinkedIn`}
          >
            <span>{dict.nav.contact}</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>

          <div className="flex items-center gap-1.5 border-l border-border pl-2 sm:pl-3">
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
            className="inline-flex items-center justify-center rounded-xs border border-border p-1.5 text-text-secondary hover:text-foreground hover:bg-surface transition-colors focus-visible:outline-primary"
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
