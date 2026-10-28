"use client";

import { useCallback, useRef, useState } from "react";
import {
	analyzeImage,
	AnalyzeError,
	type AnalysisResult,
} from "@/lib/analyze-image";
import { useLanguage } from "@/components/LanguageProvider";
import { Crosshair, Image as ImageIcon, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { ImageAnalyzerResults } from "./ImageAnalyzerResults";

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
			setResult(null);
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
			{/* Left Column: Optical Stage & Controls */}
			<section className="card flex flex-col gap-4 border-border bg-panel">
				{/* Stage Header */}
				<div className="flex items-center justify-between border-b border-border/80 pb-3">
					<div className="flex items-center gap-2">
						<Crosshair className="size-4 text-accent" />
						<h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
							{t("left.heading")}
						</h2>
					</div>
					{file && (
						<button
							type="button"
							onClick={onReset}
							className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-red-400 transition-colors"
						>
							<Trash2 className="size-3.5" />
							<span>[ {t("left.remove")} ]</span>
						</button>
					)}
				</div>

				{/* Optical Stage / Dropzone */}
				<label
					htmlFor="image-input"
					className="group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-border bg-surface/50 p-6 text-center transition hover:border-accent/60 hover:bg-surface"
				>
					{/* Technical Reticle Corners */}
					<span className="pointer-events-none absolute left-2 top-2 font-mono text-xs text-accent/70 select-none">┌</span>
					<span className="pointer-events-none absolute right-2 top-2 font-mono text-xs text-accent/70 select-none">┐</span>
					<span className="pointer-events-none absolute bottom-2 left-2 font-mono text-xs text-accent/70 select-none">└</span>
					<span className="pointer-events-none absolute bottom-2 right-2 font-mono text-xs text-accent/70 select-none">┘</span>

					{previewUrl ? (
						<div className="relative flex max-h-80 w-full items-center justify-center">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={previewUrl}
								alt={t("left.previewAlt")}
								className="max-h-72 w-auto border border-border object-contain shadow-md"
							/>
							{/* Subtle optical target overlay */}
							<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
								<div className="size-16 rounded-full border border-dashed border-accent/20" />
								<div className="absolute size-2 bg-accent/40 rounded-full" />
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center py-4">
							<div className="mb-3 flex size-12 items-center justify-center border border-border bg-panel group-hover:border-accent/60">
								<Upload className="size-5 text-accent" />
							</div>
							<span className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
								{t("left.dropzonePrompt")}
							</span>
							<span className="mt-1 font-mono text-[11px] text-muted">
								{t("left.dropzoneHint")}
							</span>
							<span className="mt-3 inline-block border border-border/80 bg-panel px-2.5 py-1 font-mono text-[10px] text-mono uppercase">
								FORMAT: PNG, JPG, WEBP | MAX: 20MB
							</span>
						</div>
					)}
					<input
						id="image-input"
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						capture="environment"
						onChange={onFileChange}
					/>
				</label>

				{/* Buffer Telemetry & Submit Button */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 pt-3">
					<div className="flex items-center gap-2 min-w-0">
						<ImageIcon className="size-4 shrink-0 text-accent" />
						<div className="min-w-0 font-mono text-[11px]">
							{file ? (
								<p className="truncate text-text font-medium">
									<span className="text-muted">BUFFER: </span>
									{file.name}
									<span className="ml-1 text-[10px] text-muted">
										({(file.size / 1024).toFixed(1)} KB)
									</span>
								</p>
							) : (
								<p className="text-muted">{t("left.noFile")}</p>
							)}
						</div>
					</div>

					<button
						type="button"
						onClick={onSubmit}
						disabled={!canSubmit}
						className="btn-primary min-w-[160px]"
					>
						{isLoading ? (
							<span className="flex items-center gap-2">
								<Loader2 className="size-3.5 animate-spin" />
								{t("left.submitting")}
							</span>
						) : (
							<span>[ {t("left.submit")} ]</span>
						)}
					</button>
				</div>

				{/* Diagnostic Error Alert */}
				{error && (
					<div className="border border-red-500/50 bg-red-500/10 p-3 font-mono text-xs text-red-400">
						<span className="font-bold">[ERR_DIAGNOSTIC]: </span>
						{error}
					</div>
				)}

				{/* Technical Calibration & Privacy Notice */}
				<div className="border border-border/60 bg-surface/40 p-2.5 font-mono text-[10px] leading-relaxed text-muted">
					<span className="font-semibold text-accent/80">[CALIBRATION NOTICE]: </span>
					{t("left.privacyNotice")}
				</div>
			</section>

			{/* Right Column: Telemetry & Inspection Layers */}
			<ImageAnalyzerResults
				file={file}
				error={error}
				result={result}
				isLoading={isLoading}
			/>
		</div>
	);
}
