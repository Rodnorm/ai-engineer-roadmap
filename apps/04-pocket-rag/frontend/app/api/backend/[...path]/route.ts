import { getOrCreateOwnerId } from '@/lib/owner-session';
import { getServerConfig } from '@/lib/server-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ path: string[] }>;
}

const REQUEST_HEADERS = ['accept', 'content-type', 'x-request-id'];
const RESPONSE_HEADERS = [
  'content-disposition',
  'content-type',
  'retry-after',
  'x-request-id',
];

async function proxy(request: Request, { params }: Context): Promise<Response> {
  try {
    const ownerId = await getOrCreateOwnerId();
    const { backendUrl, apiKey } = getServerConfig();
    const { path } = await params;
    const upstreamUrl = new URL(`${backendUrl}/`);
    const basePath = upstreamUrl.pathname.replace(/\/$/, '');
    upstreamUrl.pathname = `${basePath}/${path.map(encodeURIComponent).join('/')}`;
    upstreamUrl.search = new URL(request.url).search;

    const headers = new Headers();
    for (const name of REQUEST_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set('authorization', `Bearer ${apiKey}`);
    headers.set('x-owner-id', ownerId);
    headers.set('accept-encoding', 'identity');

    const body =
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.arrayBuffer();
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.delete('content-length');
    responseHeaders.delete('content-encoding');

    const responseData = await upstream.arrayBuffer();

    return new Response(responseData, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Pocket RAG backend proxy failed', {
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
    return Response.json(
      { error: { code: 'backend_unavailable', message: 'Backend unavailable' } },
      { status: 503 },
    );
  }
}

export async function GET(request: Request, context: Context) {
  return proxy(request, context);
}

export async function POST(request: Request, context: Context) {
  return proxy(request, context);
}

export async function DELETE(request: Request, context: Context) {
  return proxy(request, context);
}
