"use client";

import ImageAnalyzer from "@/components/ImageAnalyzer";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("page.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {t("page.subtitle")}
          </p>
        </div>
        <LanguageSelector />
      </div>

      <ImageAnalyzer />
    </main>
  );
}
