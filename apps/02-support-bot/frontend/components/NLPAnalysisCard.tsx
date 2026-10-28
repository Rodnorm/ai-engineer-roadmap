"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import { Activity, ShieldCheck, Tag } from "lucide-react";

export type NLPAnalysis = {
	language: {
		name: string;
		isoCode: string;
		confidence: number;
	};
	sentiment: {
		value: string;
		positive: number;
		neutral: number;
		negative: number;
	};
	keyPhrases: string[];
	pii?: unknown[];
	entities: {
		text: string;
		category: string;
		subcategory: string | null;
		confidence: number;
	}[];
};

export function NLPAnalysisCard({
	analysis,
}: {
	analysis?: NLPAnalysis;
}) {
	const t = useT("nlp");

	if (!analysis) return null;

	const sentimentLower = analysis.sentiment.value.toLowerCase();
	const sentimentBadgeColor =
		sentimentLower === "positive"
			? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
			: sentimentLower === "negative"
			? "text-red-400 border-red-500/40 bg-red-500/10"
			: "text-zinc-400 border-zinc-500/40 bg-zinc-500/10";

	return (
		<div className="mt-2 w-full font-mono text-xs text-text border border-border bg-panel p-3.5 shadow-none">
			{/* Drawer Header */}
			<div className="flex items-center justify-between border-b border-border/80 pb-2.5">
				<div className="flex items-center gap-2">
					<Activity className="size-3.5 text-accent" />
					<div>
						<p className="font-semibold text-text uppercase text-[11px] tracking-wider">
							[+] {t("title")}
						</p>
						<p className="text-[10px] text-muted">{t("provider")}</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5">
					<span className="border border-border bg-surface px-2 py-0.5 text-[10px] text-accent">
						LOCALE: {analysis.language.isoCode.toUpperCase()}
					</span>
					<span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 flex items-center gap-1">
						<ShieldCheck className="size-2.5" />
						<span>PII: AUDITED</span>
					</span>
				</div>
			</div>

			<div className="pt-3 space-y-3">
				{/* Language & Primary Sentiment */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
					<div className="border border-border/80 bg-surface/40 p-2">
						<p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">
							{t("language")}
						</p>
						<div className="flex items-center justify-between font-medium">
							<span>{analysis.language.name}</span>
							<span className="text-accent">
								{Math.round(analysis.language.confidence * 100)}%
							</span>
						</div>
					</div>

					<div className="border border-border/80 bg-surface/40 p-2">
						<p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">
							{t("sentiment")}
						</p>
						<div className="flex items-center justify-between">
							<span className={`inline-block border px-1.5 py-0.2 uppercase text-[10px] font-semibold ${sentimentBadgeColor}`}>
								{analysis.sentiment.value}
							</span>
						</div>
					</div>
				</div>

				{/* Sentiment Confidence Bars */}
				<div className="border border-border/80 bg-surface/40 p-2.5">
					<p className="text-[10px] uppercase tracking-wider text-muted mb-2">
						{"// "} {t("sentimentConfidence")}
					</p>

					<div className="grid grid-cols-3 gap-2">
						{[
							{ label: t("positive"), value: analysis.sentiment.positive, color: "bg-emerald-500", text: "text-emerald-400" },
							{ label: t("neutral"), value: analysis.sentiment.neutral, color: "bg-zinc-400", text: "text-zinc-400" },
							{ label: t("negative"), value: analysis.sentiment.negative, color: "bg-red-500", text: "text-red-400" },
						].map(({ label, value, color, text }) => (
							<div key={label} className="border border-border/60 bg-panel p-2">
								<div className="flex justify-between items-center text-[10px] mb-1">
									<span className="text-muted uppercase">{label}</span>
									<span className={`font-semibold ${text}`}>
										{Math.round((value as number) * 100)}%
									</span>
								</div>
								<div className="w-full bg-surface h-1 overflow-hidden">
									<div
										className={`h-full ${color}`}
										style={{ width: `${Math.round((value as number) * 100)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Key Phrases */}
				{!!analysis.keyPhrases.length && (
					<div className="border border-border/80 bg-surface/40 p-2.5">
						<p className="text-[10px] uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1.5">
							<Tag className="size-3 text-accent" />
							<span>{"// "} {t("keyPhrases")}</span>
						</p>

						<div className="flex flex-wrap gap-1.5">
							{analysis.keyPhrases.map((phrase) => (
								<span
									key={phrase}
									className="border border-border bg-panel px-2 py-0.5 text-[10px] text-mono transition hover:border-accent/40"
								>
									[KEY: &quot;{phrase}&quot;]
								</span>
							))}
						</div>
					</div>
				)}

				{/* Entities */}
				{!!analysis.entities.length && (
					<div className="border border-border/80 bg-surface/40 p-2.5">
						<p className="text-[10px] uppercase tracking-wider text-muted mb-1.5">
							{"// "} {t("entities")}
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
							{analysis.entities.map((entity, index) => (
								<div
									key={`${entity.text}-${index}`}
									className="border border-border bg-panel px-2.5 py-1.5 flex items-center justify-between text-[11px]"
								>
									<span className="font-medium text-text truncate max-w-[65%]">
										{entity.text}
									</span>
									<span className="text-[10px] text-accent/80 shrink-0">
										[{entity.category} | {Math.round(entity.confidence * 100)}%]
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
