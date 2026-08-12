// app/api/analyze/route.ts

export async function POST(request: Request) {
	const formData = await request.formData();

	const response = await fetch("http://localhost:8000/analyze", {
		method: "POST",
		body: formData,
	});

	return new Response(response.body, {
		status: response.status,
		headers: response.headers,
	});
}
