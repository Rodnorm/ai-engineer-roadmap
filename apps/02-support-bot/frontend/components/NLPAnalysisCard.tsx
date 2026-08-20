export type NLPConfidence = {
	source: string;
	parsedValue: number;
};

export type NLPAnalysis = {
	language: {
		name: string;
		isoCode: string;
		confidence: NLPConfidence;
	};
	sentiment: {
		value: string;
		positive: NLPConfidence;
		neutral: NLPConfidence;
		negative: NLPConfidence;
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
	if (!analysis) return null;

	return (
		<div className="mt-2 w-full text-sm text-slate-700">
			<div className="border border-slate-200 bg-white shadow-sm rounded-xl transition-all duration-200">
				<div className="flex items-center justify-between p-3">
					<div>
						<p className="font-medium text-slate-800">NLP Analysis</p>
						<p className="text-xs text-slate-400 mt-0.5">Azure AI Language</p>
					</div>

					<span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600">
						{analysis.language.isoCode.toUpperCase()}
					</span>
				</div>

				<div className="border-t border-slate-100 p-4 pt-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
							<p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
								Language
							</p>

							<div className="flex items-center justify-between">
								<p className="font-medium">{analysis.language.name}</p>

								<span className="text-xs text-slate-400">
									{Math.round(analysis.language.confidence.parsedValue * 100)}%
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
								["Positive", analysis.sentiment.positive.parsedValue],
								["Neutral", analysis.sentiment.neutral.parsedValue],
								["Negative", analysis.sentiment.negative.parsedValue],
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

					{!!analysis.entities.length && (
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
											{entity.subcategory
												? `${entity.category} · ${entity.subcategory} · `
												: `${entity.category} · `}
											{Math.round(entity.confidence * 100)}%
										</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
