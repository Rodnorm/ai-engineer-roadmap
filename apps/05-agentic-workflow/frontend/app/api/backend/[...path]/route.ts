import { NextRequest } from "next/server";

function getBackendBaseUrl(): string {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8005";
  return backendUrl.replace(/\/+$/, "");
}

async function forwardRequest(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await context.params;
  const backendBase = getBackendBaseUrl();
  const subPath = path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${backendBase}/${subPath}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey !== "host" &&
      lowerKey !== "connection" &&
      lowerKey !== "content-length"
    ) {
      headers.set(key, value);
    }
  });

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    const responseHeaders = new Headers(response.headers);

    const responseData = await response.arrayBuffer();

    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return Response.json(
      {
        error: {
          code: "BACKEND_UNAVAILABLE",
          message:
            error instanceof Error ? error.message : "Failed to reach backend",
        },
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return forwardRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return forwardRequest(request, context);
}
