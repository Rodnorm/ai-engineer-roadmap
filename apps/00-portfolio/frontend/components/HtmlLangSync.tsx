"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, getLocaleFromPath } from "@/lib/i18n";

export function HtmlLangSync() {
  const pathname = usePathname();

  useEffect(() => {
    const currentLocale = getLocaleFromPath(pathname || "/");

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
