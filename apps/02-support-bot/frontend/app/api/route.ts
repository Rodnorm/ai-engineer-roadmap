const SERVICE_URL = process.env.MESSAGE_SERVICE_URL;

export async function POST(request: Request) {
	if (!SERVICE_URL) throw new Error("service URL not configured");

	const body = await request.text();
	const response = await fetch(SERVICE_URL, {
		method: "POST",
		headers: {
			"Content-Type": request.headers.get("content-type") ?? "application/json",
		},
		body,
	});

	return new Response(response.body, {
		status: response.status,
		headers: response.headers,
	});
}
