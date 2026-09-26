import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "app07-owner";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias
const OWNER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEFAULT_SECRET = "app07-brief-generator-development-secret-key-32chars";

function getSessionSecret(): string {
  return (
    process.env.CONVERSATION_SESSION_SECRET ||
    process.env.SESSION_SECRET ||
    DEFAULT_SECRET
  );
}

function computeSignature(ownerId: string, secret: string): string {
  return createHmac("sha256", secret).update(ownerId).digest("base64url");
}

export function createOwnerToken(ownerId: string, secret?: string): string {
  const activeSecret = secret || getSessionSecret();
  if (!OWNER_ID_PATTERN.test(ownerId)) {
    throw new Error("Identificador de sessão de usuário inválido.");
  }
  return `${ownerId}.${computeSignature(ownerId, activeSecret)}`;
}

export function verifyOwnerToken(
  token: string | undefined,
  secret?: string
): string | undefined {
  if (!token) return undefined;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return undefined;

  const ownerId = token.slice(0, separator);
  const supplied = token.slice(separator + 1);
  if (!OWNER_ID_PATTERN.test(ownerId)) return undefined;

  const activeSecret = secret || getSessionSecret();
  const expectedBuffer = Buffer.from(computeSignature(ownerId, activeSecret));
  const suppliedBuffer = Buffer.from(supplied);

  if (expectedBuffer.length !== suppliedBuffer.length) return undefined;
  return timingSafeEqual(expectedBuffer, suppliedBuffer) ? ownerId : undefined;
}

export async function getOrCreateOwnerId(): Promise<string> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(COOKIE_NAME)?.value;
  const verifiedId = verifyOwnerToken(existingCookie);

  if (verifiedId) {
    return verifiedId;
  }

  const newOwnerId = randomUUID();
  const token = createOwnerToken(newOwnerId);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return newOwnerId;
}
