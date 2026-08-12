"use client";

import { useCallback, useRef, useState } from "react";
import {
  analyzeImage,
  AnalyzeError,
  type AnalysisResult,
} from "@/lib/analyze-image";
import { useLanguage } from "@/components/LanguageProvider";
import { splitEmphasis } from "@/lib/i18n";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Translates a failure from the analyze-image client (or a generic unknown
 * error) into the active language. The client throws `AnalyzeError` with a
 * stable, locale-neutral `failure` descriptor; anything else is treated as
 * an unknown failure.
 */
function describeFailure(
  t: ReturnType<typeof useLanguage>["t"],
  err: unknown,
): string {
  if (err instanceof AnalyzeError) {
    const f = err.failure;
    if (f.kind === "network") {
      return t("error.network", { url: f.url, reason: f.reason });
    }
    if (f.kind === "serviceStatus") {
      return f.detail
        ? t("error.serviceStatusWithDetail", {
            status: f.status,
            detail: f.detail,
          })
        : t("error.serviceStatus", { status: f.status });
    }
  }
  return t("error.unknown");
}

export default function ImageAnalyzer() {
  const { t, locale } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.files?.[0] ?? null;
      if (!next) return;

      if (!next.type.startsWith("image/")) {
        setError(t("error.invalidFile"));
        return;
      }

      setFile(next);
      setResult(null);
      setError(null);
      setStatus("idle");

      // Clean up the previous preview URL to avoid memory leaks.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(next));
    },
    [previewUrl, t],
  );

  const onSubmit = useCallback(async () => {
    if (!file) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await analyzeImage(file, locale);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(describeFailure(t, err));
      setStatus("error");
    }
  }, [file, locale, t]);

  const onReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setResult(null);
    setError(null);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [previewUrl]);

  const isLoading = status === "loading";
  const canSubmit = !!file && !isLoading;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* LEFT — upload + preview */}
      <section className="card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{t("left.heading")}</h2>
          {file && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-muted hover:text-text"
            >
              {t("left.remove")}
            </button>
          )}
        </div>

        <label
          htmlFor="image-input"
          className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg/40 p-6 text-center text-sm text-muted transition hover:border-accent hover:text-text"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={t("left.previewAlt")}
              className="max-h-80 w-auto rounded-lg object-contain"
            />
          ) : (
            <>
              <span className="text-base font-medium text-text">
                {t("left.dropzonePrompt")}
              </span>
              <span className="mt-1 text-xs">{t("left.dropzoneHint")}</span>
            </>
          )}
          <input
            id="image-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </label>

        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-xs text-muted">
            {file ? file.name : t("left.noFile")}
          </span>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="btn-primary"
          >
            {isLoading ? t("left.submitting") : t("left.submit")}
          </button>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}
      </section>

      {/* RIGHT — results */}
      <section className="card flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{t("right.heading")}</h2>
          {isLoading && (
            <span className="text-xs text-muted">{t("right.processing")}</span>
          )}
        </div>

        {!file && (
          <p className="text-sm text-muted">
            {splitEmphasis(t("right.emptyFile")).map((seg, idx) =>
              seg.bold ? (
                <b key={idx}>{seg.text}</b>
              ) : (
                <span key={idx}>{seg.text}</span>
              ),
            )}
          </p>
        )}

        {file && !result && !isLoading && !error && (
          <p className="text-sm text-muted">
            {splitEmphasis(t("right.readyToSubmit")).map((seg, idx) =>
              seg.bold ? (
                <b key={idx}>{seg.text}</b>
              ) : (
                <span key={idx}>{seg.text}</span>
              ),
            )}
          </p>
        )}

        {result && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="label mb-2">{t("result.caption")}</p>
              <p className="text-sm text-text">{result.caption || "—"}</p>
            </div>

            <div>
              <p className="label mb-2">{t("result.tags")}</p>
              {result.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">—</p>
              )}
            </div>

            <div>
              <p className="label mb-2">{t("result.objects")}</p>
              {result.objects.length > 0 ? (
                <ul className="list-inside list-disc text-sm text-text">
                  {result.objects.map((obj) => (
                    <li key={obj}>{obj}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">—</p>
              )}
            </div>

            <div>
              <p className="label mb-2">{t("result.ocr")}</p>
              <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-bg p-3 text-xs text-text">
                {result.ocr?.trim() ? result.ocr : "—"}
              </pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
