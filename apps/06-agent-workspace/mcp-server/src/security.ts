import { timingSafeEqual } from "node:crypto";

export function requiredSecret(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized || normalized.length < 32) {
    throw new Error(`${name} must contain at least 32 characters`);
  }
  return normalized;
}

export function secureTokenEquals(
  supplied: string | string[] | undefined,
  expected: string,
): boolean {
  if (!supplied || Array.isArray(supplied)) return false;
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length
    && timingSafeEqual(suppliedBuffer, expectedBuffer);
}
