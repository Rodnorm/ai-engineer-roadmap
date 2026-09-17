import { randomUUID } from "node:crypto";

function getServiceUrl(): string {
	const backendUrl = process.env.BACKEND_URL;
	if (backendUrl) {
		const base = backendUrl.replace(/\/+$/, "");
		return base.endsWith("/query") ? base : `${base}/query`;
	}
	return process.env.MESSAGE_SERVICE_URL || "";
}

export async function POST(request: Request) {
	const serviceUrl = getServiceUrl();
	const requestId = request.headers.get("x-request-id") || randomUUID();

	if (!serviceUrl) {
		return Response.json(
			{
				error: {
					code: "SERVICE_UNCONFIGURED",
					message: "Backend service URL is not configured (set BACKEND_URL or MESSAGE_SERVICE_URL)",
					request_id: requestId,
				},
			},
			{ status: 500, headers: { "x-request-id": requestId } }
		);
	}

	const body = await request.text();
	const response = await fetch(serviceUrl, {
		method: "POST",
		headers: {
			"Content-Type": request.headers.get("content-type") ?? "application/json",
			"x-request-id": requestId,
		},
		body,
	});

	const resHeaders = new Headers(response.headers);
	if (!resHeaders.has("x-request-id")) {
		resHeaders.set("x-request-id", requestId);
	}

	return new Response(response.body, {
		status: response.status,
		headers: resHeaders,
	});
}
