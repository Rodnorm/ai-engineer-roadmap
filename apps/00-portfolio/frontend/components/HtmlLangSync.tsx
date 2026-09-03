"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_HTML_LANG, Locale, LOCALE_COOKIE } from "@/lib/i18n";

function getLocaleFromPath(pathname: string): Locale {
  if (pathname === "/pt" || pathname.startsWith("/pt/")) return "pt";
  if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  return "en";
}

export function HtmlLangSync() {
  const pathname = usePathname();

  useEffect(() => {
    const currentLocale = getLocaleFromPath(pathname || "/");
    document.documentElement.lang = LOCALE_HTML_LANG[currentLocale] || "en";

    // Persist active locale
    try {
      localStorage.setItem(LOCALE_COOKIE, currentLocale);
      const oneYear = 60 * 60 * 24 * 365;
      document.cookie = `${LOCALE_COOKIE}=${currentLocale}; path=/; max-age=${oneYear}; SameSite=Lax`;
    } catch {
      // Storage might be restricted
    }
  }, [pathname]);

  return null;
}
