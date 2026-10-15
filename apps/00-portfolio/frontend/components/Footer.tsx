"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary, getLocalizedPath, getLocaleFromPath } from "@/lib/i18n";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/personal-content";

export function Footer() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPath(pathname);
  const dict = getDictionary(locale);

  return (
    <footer className="border-t border-border bg-background py-8 mt-16 text-text-muted text-xs transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <p className="text-center sm:text-left">{dict.footer.copyright}</p>
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-text-secondary">
          <Link
            href={getLocalizedPath("/about", locale)}
            className="hover:text-primary transition-colors"
          >
            {dict.footer.about}
          </Link>
          <span className="text-border" aria-hidden="true">/</span>
          <Link
            href={getLocalizedPath("/datenschutz", locale)}
            className="hover:text-primary transition-colors"
          >
            {locale === "de" ? "Datenschutz" : locale === "pt" ? "Privacidade" : "Privacy"}
          </Link>
          <span className="text-border" aria-hidden="true">/</span>
          <Link
            href={getLocalizedPath("/impressum", locale)}
            className="hover:text-primary transition-colors"
          >
            {locale === "de" ? "Impressum" : locale === "pt" ? "Aviso Legal" : "Legal Notice"}
          </Link>
          <span className="text-border" aria-hidden="true">/</span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <span className="text-border" aria-hidden="true">/</span>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
