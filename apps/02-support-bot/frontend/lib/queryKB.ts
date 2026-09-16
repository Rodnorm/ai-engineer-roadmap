/**
 * Stable, locale-neutral failure descriptor. The UI translates this via
 * the i18n module so the same error surfaces in whichever language the
 * user has selected.
 */
export type MessaginFailure =
	| { kind: "network"; url: string; reason: string }
	| { kind: "serviceStatus"; status: number; detail?: string };

export class MessagingErrror extends Error {
	readonly failure: MessaginFailure;

	constructor(failure: MessaginFailure) {
		super(failure.kind);
		this.failure = failure;
	}
}

export async function queryMessage(
	message: string,
	signal?: AbortSignal
) {
	let res: Response;
	try {
		res = await fetch("/api", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query: message }),
			signal,
		});
	} catch (err) {
		const reason = err instanceof Error ? err.message : "network error";
		throw new MessagingErrror({ kind: "network", url: "/api", reason });
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
		throw new MessagingErrror(
			detail !== undefined
				? { kind: "serviceStatus", status: res.status, detail }
				: { kind: "serviceStatus", status: res.status },
		);
	}

	const data = await res.json();
	return data.response;
}
