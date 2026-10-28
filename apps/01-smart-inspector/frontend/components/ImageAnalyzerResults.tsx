import { Activity, Captions, Check, CircleDollarSign, Copy, ExternalLink, Layers, Scan, ScanBox, SquareDashedText, Tag } from "lucide-react";
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
        <section className="card flex flex-col gap-4 border-border bg-panel">
            {/* Telemetry Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                    <Layers className="size-4 text-accent" />
                    <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
                        {t("right.heading")}
                    </h2>
                </div>

                {isLoading && (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-accent">
                        <Activity className="size-3 animate-pulse" />
                        <span>[ {t("right.processing")} ]</span>
                    </span>
                )}
                {!isLoading && file && result && (
                    <span className="inline-flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                        <Check className="size-3" />
                        <span>[ {t("right.success")} ]</span>
                    </span>
                )}
                {!isLoading && !result && (
                    <span className="font-mono text-[10px] uppercase text-muted">
                        [ STANDBY ]
                    </span>
                )}
            </div>

            {/* Skeleton state */}
            {isLoading && <ResultSkeleton />}

            {/* Empty state: No file uploaded yet */}
            {!isLoading && !file && (
                <div className="flex min-h-[260px] flex-col items-center justify-center border border-dashed border-border/80 bg-surface/30 p-8 text-center font-mono text-xs text-muted">
                    <Scan className="mb-3 size-8 text-muted/60" />
                    <p className="max-w-sm text-balance leading-relaxed">
                        {splitEmphasis(t("right.emptyFile")).map((seg, idx) =>
                            seg.bold ? (
                                <b key={idx} className="text-text font-semibold">{seg.text}</b>
                            ) : (
                                <span key={idx}>{seg.text}</span>
                            ),
                        )}
                    </p>
                    <span className="mt-3 text-[10px] text-muted/80">
                        AWAITING_INPUT_CAPTURE // SLOT_01
                    </span>
                </div>
            )}

            {/* Ready to submit state */}
            {file && !result && !isLoading && !error && (
                <div className="flex min-h-[260px] flex-col items-center justify-center border border-border/80 bg-surface/30 p-8 text-center font-mono text-xs text-muted">
                    <div className="mb-3 size-2 bg-accent animate-ping rounded-full" />
                    <p className="max-w-sm text-balance leading-relaxed">
                        {splitEmphasis(t("right.readyToSubmit")).map((seg, idx) =>
                            seg.bold ? (
                                <b key={idx} className="text-text font-semibold">{seg.text}</b>
                            ) : (
                                <span key={idx}>{seg.text}</span>
                            ),
                        )}
                    </p>
                    <span className="mt-3 border border-accent/40 bg-accent/10 px-2 py-1 text-[10px] text-accent">
                        READY_FOR_EXECUTION
                    </span>
                </div>
            )}

            {/* Results Inspection Layers */}
            {result && (
                <div className="flex flex-col gap-4 font-mono text-xs">
                    {/* Layer 01: Caption */}
                    <div className="border border-border bg-surface/40 p-3.5">
                        <div className="flex items-center gap-2 text-accent pb-2 border-b border-border/60">
                            <Captions className="size-3.5" />
                            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                                {"// 01: "} {t("result.caption")}
                            </span>
                        </div>
                        <p className="mt-2.5 font-sans text-xs leading-relaxed text-text">
                            {result.caption || "—"}
                        </p>
                    </div>

                    {/* Layer 02: Tags */}
                    <div className="border border-border bg-surface/40 p-3.5">
                        <div className="flex items-center gap-2 text-accent pb-2 border-b border-border/60">
                            <Tag className="size-3.5" />
                            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                                {"// 02: "} {t("result.tags")}
                            </span>
                        </div>
                        <div className="mt-2.5">
                            {result.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {result.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center border border-border bg-panel px-2 py-0.5 font-mono text-[11px] text-mono transition hover:border-accent/60 hover:text-text"
                                        >
                                            <span className="text-accent/60 mr-1">#</span>{tag}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">—</p>
                            )}
                        </div>
                    </div>

                    {/* Layer 03: Objects */}
                    <div className="border border-border bg-surface/40 p-3.5">
                        <div className="flex items-center gap-2 text-accent pb-2 border-b border-border/60">
                            <ScanBox className="size-3.5" />
                            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                                {"// 03: "} {t("result.objects")}
                            </span>
                        </div>
                        <div className="mt-2.5">
                            {result.objects.length > 0 ? (
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                                    {result.objects.map((obj, idx) => (
                                        <li
                                            key={obj}
                                            className="flex items-center gap-2 border border-border/70 bg-panel px-2.5 py-1 text-text"
                                        >
                                            <span className="text-[10px] text-muted">
                                                [{String(idx + 1).padStart(2, "0")}]
                                            </span>
                                            <span className="truncate">{obj}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">—</p>
                            )}
                        </div>
                    </div>

                    {/* Layer 04: OCR Stream Buffer */}
                    <div className="border border-border bg-surface/40 p-3.5">
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                            <div className="flex items-center gap-2 text-accent">
                                <SquareDashedText className="size-3.5" />
                                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                                    {"// 04: "} {t("result.ocr")}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {copied && (
                                    <span className="font-mono text-[10px] text-accent">
                                        [ {t("right.copied")} ]
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={onCopy}
                                    disabled={!result.ocr?.trim()}
                                    className="inline-flex items-center gap-1 border border-border bg-panel px-2 py-0.5 font-mono text-[10px] text-muted transition hover:border-accent/60 hover:text-text disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={t("right.copy")}
                                >
                                    <Copy className="size-3" />
                                    <span>[ COPY ]</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-2.5 border border-border bg-panel">
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-2.5 font-mono text-[11px] leading-relaxed text-mono selection:bg-accent/20">
                                {result.ocr?.trim() ? result.ocr : "— [NO OCR CONTENT DETECTED]"}
                            </pre>
                        </div>
                    </div>

                    {/* Layer 05: Valuation & Commerce */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Average Price */}
                        <div className="border border-border bg-surface/40 p-3.5">
                            <div className="flex items-center gap-1.5 text-accent pb-1.5 border-b border-border/60">
                                <CircleDollarSign className="size-3.5" />
                                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                                    {t("result.averagePrice")}
                                </span>
                            </div>
                            <p className="mt-2 font-mono text-sm font-semibold text-text">
                                {result.averagePrice || "—"}
                            </p>
                        </div>

                        {/* Lowest Price Link */}
                        <div className="border border-border bg-surface/40 p-3.5">
                            <div className="flex items-center gap-1.5 text-accent pb-1.5 border-b border-border/60">
                                <ExternalLink className="size-3.5" />
                                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                                    {t("result.lowestPriceLink")}
                                </span>
                            </div>
                            <div className="mt-2">
                                {result.lowestPriceLink && result.lowestPriceLink.trim() !== "" ? (
                                    <a
                                        href={result.lowestPriceLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline break-all"
                                    >
                                        <span>[ VISIT_VENDOR ]</span>
                                        <ExternalLink className="size-3" />
                                    </a>
                                ) : (
                                    <p className="font-mono text-xs text-muted">—</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}