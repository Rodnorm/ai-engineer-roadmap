"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, Locale, LOCALE_LABELS, getLocalizedPath, LOCALE_COOKIE } from "@/lib/i18n";
import { Globe } from "lucide-react";

function getLocaleFromPath(pathname: string): Locale {
  if (pathname === "/pt" || pathname.startsWith("/pt/")) return "pt";
  if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  return "en";
}

export function LanguageSelector() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const currentLocale = getLocaleFromPath(pathname);

  const handleSelectLocale = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;

    try {
      localStorage.setItem(LOCALE_COOKIE, targetLocale);
      const oneYear = 60 * 60 * 24 * 365;
      document.cookie = `${LOCALE_COOKIE}=${targetLocale}; path=/; max-age=${oneYear}; SameSite=Lax`;
    } catch {
      // storage not available
    }

    const nextPath = getLocalizedPath(pathname, targetLocale);
    router.push(nextPath);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border text-xs transition-colors duration-200">
      <Globe className="w-3.5 h-3.5 text-text-muted ml-1 flex-shrink-0" aria-hidden="true" />
      <div className="flex items-center gap-0.5" role="group" aria-label="Language selector">
        {LOCALES.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <button
              key={locale}
              type="button"
              onClick={() => handleSelectLocale(locale)}
              aria-pressed={isActive}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                isActive
                  ? "bg-primary text-slate-950 shadow-sm"
                  : "text-text-muted hover:text-foreground hover:bg-surface-muted"
              }`}
              title={LOCALE_LABELS[locale]}
            >
              {locale === "en" ? "EN" : locale === "pt" ? "PT" : "DE"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
