"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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
	entities?: {
		text: string;
		category: string;
		confidence: number;
	}[];
};

export function NLPAnalysisCard({ analysis }: { analysis?: NLPAnalysis }) {
	const [open, setOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const disabled = !analysis;

	useEffect(() => {
		if (!open) return;

		requestAnimationFrame(() => {
			cardRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	}, [open]);

	return (
		<div className="mt-4 m-b-4 w-full mb-6 text-sm text-slate-700" ref={cardRef}>
			<div className="border border-slate-200 bg-white shadow-sm rounded-xl transition-all duration-200">
                <button
					type="button"
                    disabled={disabled}
					onClick={() => setOpen((prev) => !prev)}
					aria-expanded={open}
					className="group flex w-full items-center justify-between p-4 text-left cursor-pointer hover:bg-sky-50/40 rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
				>
					<div>
						<p className="font-medium text-slate-800">NLP Analysis</p>

						<p className="text-xs text-slate-400 mt-0.5">Azure AI Language</p>
					</div>

					<div className="flex items-center gap-3">
						<span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600">
							
                            {disabled ? 'Analysis Unavailable' : analysis.language.isoCode.toUpperCase()}
						</span>

						<ChevronDown
							className={`w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-transform duration-200 ${
								open ? "rotate-180" : ""
							}`}
						/>
					</div>
				</button>

				{open && analysis && (
					<div className="border-t border-slate-100 p-4 pt-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
								<p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
									Language
								</p>

								<div className="flex items-center justify-between">
									<p className="font-medium">{analysis.language.name}</p>

									<span className="text-xs text-slate-400">
										{Math.round(analysis.language.confidence * 100)}%
									</span>
								</div>
							</div>

							<div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
								<p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
									Sentiment
								</p>

								<p className="font-medium capitalize">
									{analysis.sentiment.value}
								</p>
							</div>
						</div>

						<div className="mt-4">
							<p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
								Sentiment confidence
							</p>

							<div className="grid grid-cols-3 gap-2">
								{[
									["Positive", analysis.sentiment.positive],
									["Neutral", analysis.sentiment.neutral],
									["Negative", analysis.sentiment.negative],
								].map(([label, value]) => (
									<div
										key={label as string}
										className="rounded-lg border border-slate-100 bg-slate-50/50 p-2"
									>
										<p className="text-xs text-slate-400">{label as string}</p>

										<p className="font-medium">
											{Math.round((value as number) * 100)}%
										</p>
									</div>
								))}
							</div>
						</div>

						{!!analysis.keyPhrases.length && (
							<div className="mt-4">
								<p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
									Key phrases
								</p>

								<div className="flex flex-wrap gap-2">
									{analysis.keyPhrases.map((phrase) => (
										<span
											key={phrase}
											className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 shadow-sm"
										>
											{phrase}
										</span>
									))}
								</div>
							</div>
						)}

						{!!analysis.entities?.length && (
							<div className="mt-4">
								<p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
									Entities
								</p>

								<div className="flex flex-wrap gap-2">
									{analysis.entities.map((entity, index) => (
										<div
											key={`${entity.text}-${index}`}
											className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
										>
											<p className="font-medium">{entity.text}</p>

											<p className="text-xs text-slate-400">
												{entity.category} ·{" "}
												{Math.round(entity.confidence * 100)}%
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
