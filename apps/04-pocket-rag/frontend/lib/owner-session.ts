import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getServerConfig } from './server-config';

const COOKIE_NAME = 'pocket-rag-owner';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const OWNER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function signature(ownerId: string, secret: string): string {
  return createHmac('sha256', secret).update(ownerId).digest('base64url');
}

export function createOwnerToken(ownerId: string, secret: string): string {
  if (!OWNER_ID_PATTERN.test(ownerId)) throw new Error('Invalid owner identifier');
  return `${ownerId}.${signature(ownerId, secret)}`;
}

export function verifyOwnerToken(
  token: string | undefined,
  secret: string,
): string | undefined {
  if (!token) return undefined;
  const separator = token.lastIndexOf('.');
  if (separator < 1) return undefined;

  const ownerId = token.slice(0, separator);
  const supplied = token.slice(separator + 1);
  if (!OWNER_ID_PATTERN.test(ownerId)) return undefined;

  const expectedBuffer = Buffer.from(signature(ownerId, secret));
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length) return undefined;
  return timingSafeEqual(expectedBuffer, suppliedBuffer) ? ownerId : undefined;
}

export async function getOrCreateOwnerId(): Promise<string> {
  const cookieStore = await cookies();
  const { sessionSecret } = getServerConfig();
  const existing = verifyOwnerToken(
    cookieStore.get(COOKIE_NAME)?.value,
    sessionSecret,
  );
  if (existing) return existing;

  const ownerId = randomUUID();
  cookieStore.set(COOKIE_NAME, createOwnerToken(ownerId, sessionSecret), {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return ownerId;
}
