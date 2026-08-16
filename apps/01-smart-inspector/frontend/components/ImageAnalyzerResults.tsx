import { Captions, CircleDollarSign, Copy, ExternalLink, ScanBox, SquareDashedText, Tag } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { AnalysisResult } from "@/lib/analyze-image";
import ResultSkeleton from "./resultSkeleton";
import { splitEmphasis } from "@/lib/i18n";
import { useState } from "react";

export function ImageAnalyzerResults({ isLoading, file, result, error }: {
    isLoading: boolean;
    file: File | null;
    result: AnalysisResult | null;
    error: string | null;
}) {
    const { t } = useLanguage();

    const [copied, setCopied] = useState(false);

    const onCopy = async () => {
        if (!result?.ocr?.trim()) return;

        await navigator.clipboard.writeText(result.ocr);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    return (
        <section className="card flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{t("right.heading")}</h2>
                {isLoading && (
                    <span className="text-xs text-muted">{t("right.processing")}</span>
                )}
                {!isLoading && file && result && (
                    <span className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 inset-ring inset-ring-green-500/20">
                        {t("right.success")}
                    </span>
                )}
            </div>
            {isLoading && <ResultSkeleton />}

            {!isLoading && !file && (
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
                        <div className="flex items-center gap-2">
                            <Captions className="h-4 w-4 mb-2 stroke-sky-500" />
                            <p className="label mb-2">{t("result.caption")}</p>
                        </div>
                        <p className="text-sm text-text">{result.caption || "—"}</p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 mb-2 stroke-sky-500" />
                            <p className="label mb-2">{t("result.tags")}</p>
                        </div>
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
                        <div className="flex items-center gap-2">
                            <ScanBox className="h-4 w-4 mb-2 stroke-sky-500" />
                            <p className="label mb-2">{t("result.objects")}</p>
                        </div>
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
                        <div className="flex items-center gap-2">
                            <SquareDashedText className="mb-2 h-4 w-4 stroke-sky-500" />
                            <p className="label mb-2">{t("result.ocr")}</p>
                        </div>

                        <div className="rounded-md border border-border bg-bg">
                            <div className="flex items-center justify-between border-b border-border px-3 py-2">
                                <span className="text-xs text-text-muted">
                                    {result.ocr?.trim() ? "OCR" : "—"}
                                </span>

                                <div className="flex items-center gap-2">
                                    {copied && (
                                        <span className="text-xs text-sky-500">
                                            {t("right.copied")}
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={onCopy}
                                        disabled={!result.ocr?.trim()}
                                        className="cursor-pointer rounded p-1.5 transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                                        title={t("right.copy")}
                                    >
                                        <Copy className="h-4 w-4 stroke-sky-500" />
                                    </button>
                                </div>
                            </div>

                            <pre className="max-h-60 overflow-auto whitespace-pre-wrap p-3 text-xs text-text">
                                {result.ocr?.trim() ? result.ocr : "—"}
                            </pre>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4 mb-2 stroke-lime-500" />
                            <p className="label mb-2">{t("result.averagePrice")}</p>
                        </div>
                        <p className="text-sm text-text">{result.averagePrice || "—"}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 mb-2 stroke-blue-500" />
                            <p className="label mb-2">{t("result.lowestPriceLink")}</p>
                        </div>
                        <a
                            href={result.lowestPriceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm text-blue-500 hover:underline ${!result.lowestPriceLink || result.lowestPriceLink.trim() === "" ? "pointer-events-none" : ""}`}
                        >
                            {result.lowestPriceLink || "—"}
                        </a>
                    </div>
                </div>
            )}
        </section>
    )
};