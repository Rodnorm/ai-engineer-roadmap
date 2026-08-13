const SERVICE_URL = process.env.NEXT_PUBLIC_ANALYZE_SERVICE_URL;

export async function POST(request: Request) {
	const formData = await request.formData();

	if (!SERVICE_URL) throw new Error("service URL not configured");

	const response = await fetch(SERVICE_URL, {
		method: "POST",
		body: formData,
	});

	return new Response(response.body, {
		status: response.status,
		headers: response.headers,
	});
}
