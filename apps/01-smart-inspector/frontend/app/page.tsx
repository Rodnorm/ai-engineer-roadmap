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
          <h1 className="text-4xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
              Smart
            </span>{" "}
            <span className="text-text">
              Inspector
            </span>
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
