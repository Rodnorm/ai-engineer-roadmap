import { NextRequest } from "next/server";

function getBackendBaseUrl(): string {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8005";
  return backendUrl.replace(/\/+$/, "");
}

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function forwardRequest(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  const backendBase = getBackendBaseUrl();
  const subPath = path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${backendBase}/${subPath}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("connection");

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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
export const OPTIONS = forwardRequest;
