"use client";

import { useMemo, useState } from "react";

import type { Variation } from "@/components/PromptForge";
import { useT } from "@/lib/i18n/I18nProvider";

export default function GenerationResults({ results, isGenerating, personaName }: { results: Variation[]; isGenerating: boolean; personaName: string }) {
  const t = useT("results");
  const [view, setView] = useState<"preview" | "json">("preview");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const structuredOutput = useMemo(
    () => results.map(({ title, body, seoKeywords }) => ({ title, body, seoKeywords })),
    [results],
  );

  const copyVariation = async (variation: Variation) => {
    await navigator.clipboard.writeText(`${variation.title}\n\n${variation.body}\n\n${variation.seoKeywords.join(", ")}`);
    setCopiedId(variation.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(structuredOutput, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "content-variations.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-10" aria-labelledby="results-title">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 id="results-title" className="text-xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1" role="group" aria-label={t("title")}>
            <button type="button" onClick={() => setView("preview")} className={`view-tab ${view === "preview" ? "view-tab-active" : ""}`}>{t("preview")}</button>
            <button type="button" onClick={() => setView("json")} className={`view-tab ${view === "json" ? "view-tab-active" : ""}`}>{t("json")}</button>
          </div>
          <button type="button" onClick={exportJson} disabled={results.length === 0 || isGenerating} className="btn-secondary px-3 py-2 text-xs">{t("export")}</button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-panel text-accent"><EmptyIcon /></span>
          <h3 className="mt-4 text-sm font-semibold">{t("emptyTitle")}</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{t("emptyDescription")}</p>
        </div>
      ) : view === "json" ? (
        <pre className="code-scroll mt-5 max-h-[36rem] overflow-auto rounded-2xl border border-border bg-code p-5 text-xs leading-relaxed text-code-text"><code>{JSON.stringify(structuredOutput, null, 2)}</code></pre>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {results.map((variation) => (
            <article key={variation.id} className="result-card animate-result-in">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-accent-strong">{t("variation", { number: variation.id })}</span>
                <button type="button" onClick={() => void copyVariation(variation)} className="icon-button" aria-label={t("copy")} title={t("copy")}>
                  {copiedId === variation.id ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
              <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-wide text-muted">{personaName}</p>
              <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight">{variation.title}</h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted">{variation.body}</p>
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">{t("seoKeywords")}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {variation.seoKeywords.map((keyword) => <li key={keyword} className="rounded-full border border-border bg-surface px-2.5 py-1 text-[0.65rem] text-muted">{keyword}</li>)}
                </ul>
                <div className="mt-4 flex items-center justify-between text-[0.65rem] text-muted">
                  <span>{t("words", { count: variation.body.trim().split(/\s+/).length })}</span>
                  <span>{copiedId === variation.id ? t("copied") : t("responseDetails", { tokens: variation.tokens, cost: variation.cost.toFixed(4) })}</span>
                </div>
              </div>
            </article>
          ))}
          {isGenerating && Array.from({ length: 3 - results.length }).map((_, index) => <ResultSkeleton key={index} />)}
        </div>
      )}
    </section>
  );
}

function ResultSkeleton() {
  return <div className="result-card animate-pulse" aria-hidden="true"><div className="h-5 w-24 rounded-full bg-surface" /><div className="mt-6 h-5 w-4/5 rounded bg-surface" /><div className="mt-4 h-3 w-full rounded bg-surface" /><div className="mt-2 h-3 w-11/12 rounded bg-surface" /><div className="mt-2 h-3 w-3/4 rounded bg-surface" /></div>;
}

function EmptyIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" /><path d="M14 3v6h6M8 14h8M8 17h5" /></svg>;
}

function CopyIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></svg>;
}

function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-success" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}
