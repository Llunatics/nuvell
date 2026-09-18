import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'nuvell_admin_session';

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || 'nuvelll_admin_secret_key_2026';
}

function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Timing-safe string comparison to prevent timing side-channel attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Constant time compare dummy to avoid timing leak of length
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies submitted secret against ADMIN_SECRET
 */
export function verifyAdminSecret(secret: string): boolean {
  const configuredSecret = getAdminSecret();
  return timingSafeCompare(secret.trim(), configuredSecret.trim());
}

/**
 * Creates signed session token valid for 8 hours
 */
export function createAdminSessionToken(): string {
  const secret = getAdminSecret();
  const timestamp = Date.now().toString();
  const signature = generateSignature(timestamp, secret);
  return `${timestamp}.${signature}`;
}

/**
 * Validates session token
 */
export function validateAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max age: 8 hours
  const maxAgeMs = 8 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  const secret = getAdminSecret();
  const expectedSignature = generateSignature(timestampStr, secret);
  return timingSafeCompare(providedSignature, expectedSignature);
}

/**
 * Server-side helper to check if incoming request or cookies is from an authenticated admin
 */
export async function isServerAdminAuthenticated(req?: Request): Promise<boolean> {
  // 1. Check direct header: x-admin-secret
  if (req) {
    const headerSecret = req.headers.get('x-admin-secret');
    if (headerSecret && verifyAdminSecret(headerSecret)) {
      return true;
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (verifyAdminSecret(token) || validateAdminSessionToken(token)) {
        return true;
      }
    }
  }

  // 2. Check httpOnly cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return validateAdminSessionToken(sessionCookie);
  } catch {
    return false;
  }
}

export { ADMIN_COOKIE_NAME };
