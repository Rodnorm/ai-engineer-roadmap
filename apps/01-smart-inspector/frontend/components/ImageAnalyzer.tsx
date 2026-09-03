"use client";

import { useCallback, useRef, useState } from "react";
import {
	analyzeImage,
	AnalyzeError,
	type AnalysisResult,
} from "@/lib/analyze-image";
import { useLanguage } from "@/components/LanguageProvider";
import { Image, Trash2, Upload } from "lucide-react";
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
			<section className="card flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-medium">{t("left.heading")}</h2>
					{file && (
						<button
							type="button"
							onClick={onReset}
							className="mr-1 text-xs text-muted hover:text-text"
						>

							<Trash2 className="mb-1 mr-1 inline h-3 w-3 stroke-sky-500" />
							<span className="mb-2 mr-1 inline">{t("left.remove")}</span>

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
							<Upload className="mb-2 h-10 w-10 stroke-sky-500" />
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
						capture="environment"
						onChange={onFileChange}
					/>
				</label>

				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Image className="h-4 w-4 stroke-sky-500" />
						<span className="truncate text-xs text-muted">
							{file ? file.name : t("left.noFile")}
						</span>
					</div>
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
					<p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
						{error}
					</p>
				)}

				<p className="mt-1 text-balance text-center text-[11px] leading-relaxed text-muted/80">
					{t("left.privacyNotice")}
				</p>
			</section>

			<ImageAnalyzerResults
				file={file}
				error={error}
				result={result}
				isLoading={isLoading}
			/>
		</div>
	);
}
