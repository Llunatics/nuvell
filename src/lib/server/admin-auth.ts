import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'nuvell_admin_session';

function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  return secret || null;
}

let inMemorySigningKey: string | null = null;

function getSigningKey(): string {
  // Use ADMIN_SECRET if explicitly configured on server
  const adminSecret = getAdminSecret();
  if (adminSecret) return adminSecret;

  if (process.env.SESSION_SECRET?.trim()) {
    return process.env.SESSION_SECRET.trim();
  }

  // Generates cryptographically unforgeable 256-bit runtime key
  if (!inMemorySigningKey) {
    inMemorySigningKey = crypto.randomBytes(32).toString('hex');
  }
  return inMemorySigningKey;
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
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies submitted secret against ADMIN_SECRET from environment.
 * NEVER allows hardcoded default passwords.
 */
export function verifyAdminSecret(secret: string): boolean {
  const configuredSecret = getAdminSecret();
  if (!configuredSecret) {
    return false;
  }
  return timingSafeCompare(secret.trim(), configuredSecret);
}

/**
 * Checks if an email is listed in ADMIN_EMAILS environment variable
 */
export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const envList = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  const adminEmails = envList
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) return false;
  return adminEmails.includes(email.trim().toLowerCase());
}

/**
 * Verifies a Firebase ID token using Google Identity Toolkit API or JWT decode
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<string | null> {
  if (!idToken || typeof idToken !== 'string') return null;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const user = data.users?.[0];
        if (user?.email) {
          return user.email.toLowerCase();
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback JWT payload inspection
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        if (payload.email && typeof payload.email === 'string') {
          return payload.email.toLowerCase();
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Creates signed session token valid for 8 hours
 */
export function createAdminSessionToken(identifier = 'admin'): string {
  const key = getSigningKey();
  const timestamp = Date.now().toString();
  const payload = `${encodeURIComponent(identifier)}:${timestamp}`;
  const signature = generateSignature(payload, key);
  return `${payload}.${signature}`;
}

/**
 * Validates session token
 */
export function validateAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, providedSignature] = parts;
  const colonIdx = payload.indexOf(':');
  if (colonIdx === -1) return false;

  const timestampStr = payload.substring(colonIdx + 1);
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max age: 8 hours
  const maxAgeMs = 8 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  const key = getSigningKey();
  const expectedSignature = generateSignature(payload, key);
  return timingSafeCompare(providedSignature, expectedSignature);
}

/**
 * Server-side helper to check if incoming request or cookies is from an authenticated admin
 */
export async function isServerAdminAuthenticated(req?: Request): Promise<boolean> {
  // 1. Direct header check: x-admin-secret
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

  // 2. httpOnly session cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return validateAdminSessionToken(sessionCookie);
  } catch {
    return false;
  }
}

export { ADMIN_COOKIE_NAME };
