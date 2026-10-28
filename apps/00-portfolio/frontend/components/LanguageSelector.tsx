"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, Locale, LOCALE_LABELS, getLocalizedPath, LOCALE_COOKIE, getLocaleFromPath } from "@/lib/i18n";
import { Globe } from "lucide-react";

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
    <div className="relative inline-flex flex-shrink-0 items-center gap-0.5 rounded-xs border border-border bg-surface p-0.5 text-xs transition-colors duration-200 sm:gap-1 sm:p-0.5 font-mono">
      <Globe className="ml-1 hidden h-3 w-3 flex-shrink-0 text-text-muted sm:block" aria-hidden="true" />
      <div className="flex items-center gap-0" role="group" aria-label="Language selector">
        {LOCALES.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <button
              key={locale}
              type="button"
              onClick={() => handleSelectLocale(locale)}
              aria-pressed={isActive}
              className={`rounded-xs px-1.5 py-0.5 text-[10px] font-mono font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
                isActive
                  ? "bg-foreground text-background font-bold shadow-xs"
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
