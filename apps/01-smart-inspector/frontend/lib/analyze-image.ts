/**
 * Contract with the external analysis service (FastAPI at backend/smart-inspector.py).
 * Endpoint URL is configured via NEXT_PUBLIC_ANALYZE_SERVICE_URL or ANALYZE_SERVICE_URL.
 */
export type AnalysisResult = {
	tags: string[];
	caption: string;
	objects: string[];
	ocr: string;
	averagePrice: string;
	lowestPriceLink: string;
};

/**
 * Locales the backend knows how to instruct the model in. The frontend
 * also supports `pt-BR`, which is sent as `pt-BR` to keep the wire format
 * stable (the backend maps it to a human-readable language name).
 */
export type AnalyzeLocale = "pt-BR" | "en" | "de";

/**
 * Stable, locale-neutral failure descriptor. The UI translates this via
 * the i18n module so the same error surfaces in whichever language the
 * user has selected.
 */
export type AnalyzeFailure =
	| { kind: "network"; url: string; reason: string }
	| { kind: "serviceStatus"; status: number; detail?: string };

export class AnalyzeError extends Error {
	readonly failure: AnalyzeFailure;

	constructor(failure: AnalyzeFailure) {
		super(failure.kind);
		this.failure = failure;
	}
}

const SERVICE_URL =
	process.env.NEXT_PUBLIC_ANALYZE_SERVICE_URL ??
	process.env.ANALYZE_SERVICE_URL ??
	"http://localhost:8000/analyze";

/**
 * Sends the image to the analysis service as multipart/form-data and returns
 * its structured output ({ caption, tags, objects, ocr }). The `locale`
 * instructs the model to render every human-readable field in that language.
 */
export async function analyzeImage(
	file: File,
	locale: AnalyzeLocale = "de",
): Promise<AnalysisResult> {
	const form = new FormData();
	form.append("image", file);
	form.append("language", locale);

	let res: Response;
	try {
		res = await fetch("/api/analyze", { method: "POST", body: form });
	} catch (err) {
		const reason = err instanceof Error ? err.message : "network error";
		throw new AnalyzeError({ kind: "network", url: SERVICE_URL, reason });
	}

	if (!res.ok) {
		// Try to surface the backend's error message if it provided one.
		let detail: string | undefined;
		try {
			const body = (await res.json()) as { detail?: unknown };
			if (typeof body?.detail === "string") detail = body.detail;
		} catch {
			/* ignore */
		}
		throw new AnalyzeError(
			detail !== undefined
				? { kind: "serviceStatus", status: res.status, detail }
				: { kind: "serviceStatus", status: res.status },
		);
	}

	const data = (await res.json()) as Partial<AnalysisResult>;
	return {
		caption: typeof data.caption === "string" ? data.caption : "",
		tags: Array.isArray(data.tags)
			? data.tags.filter((t) => typeof t === "string")
			: [],
		objects: Array.isArray(data.objects)
			? data.objects.filter((o) => typeof o === "string")
			: [],
		ocr: typeof data.ocr === "string" ? data.ocr : "",
		averagePrice:
			typeof data.averagePrice === "string" ? data.averagePrice : "",
		lowestPriceLink:
			typeof data.lowestPriceLink === "string" ? data.lowestPriceLink : "",
	};
}
