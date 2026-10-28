"use client";

import ImageAnalyzer from "@/components/ImageAnalyzer";
import AppInfo from "@/components/AppInfo";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/components/LanguageProvider";
import { getAppInfo } from "@/lib/app-info";

export default function HomePage() {
  const { locale, t } = useLanguage();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-accent">
            <span className="inline-block size-2 bg-accent animate-pulse" />
            <span>[+] OPTICS_STUDIO :: MULTIMODAL_INSPECTOR v1.0</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl font-mono uppercase">
            Smart <span className="text-accent">Inspector</span>
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs text-muted font-mono leading-relaxed">
            {t("page.subtitle")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AppInfo config={getAppInfo(locale)} />
          <LanguageSelector />
        </div>
      </div>

      <ImageAnalyzer />
    </main>
  );
}
