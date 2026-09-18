import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminSecret,
  isAuthorizedAdminEmail,
  verifyFirebaseIdToken,
  createAdminSessionToken,
  validateAdminSessionToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/server/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const secret = body?.secret;
    const email = body?.email;
    const idToken = body?.idToken;

    if (!secret && !email && !idToken) {
      return NextResponse.json(
        { success: false, error: 'Kredensial admin crawler (token autentikasi atau kunci rahasia) wajib disertakan.' },
        { status: 400 }
      );
    }

    // Artificial short delay to prevent timing / brute force enumeration
    await new Promise((r) => setTimeout(r, 300));

    let isAuthorized = false;
    let identifier = 'admin';

    // 1. Verify cryptographically via Firebase ID Token
    if (idToken && typeof idToken === 'string') {
      const verifiedEmail = await verifyFirebaseIdToken(idToken);
      if (verifiedEmail && isAuthorizedAdminEmail(verifiedEmail)) {
        isAuthorized = true;
        identifier = verifiedEmail;
      }
    }

    // 2. Verify via registered admin email
    if (!isAuthorized && email && typeof email === 'string' && isAuthorizedAdminEmail(email)) {
      isAuthorized = true;
      identifier = email.trim().toLowerCase();
    }

    // 3. Verify via server ADMIN_SECRET environment variable (zero fallback)
    if (!isAuthorized && secret && typeof secret === 'string' && verifyAdminSecret(secret)) {
      isAuthorized = true;
      identifier = 'server-secret';
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Akun atau kredensial ini tidak memiliki izin administrator crawler.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(identifier);
    const response = NextResponse.json({
      success: true,
      message: 'Autentikasi admin berhasil.',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memverifikasi kunci admin.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = validateAdminSessionToken(token);

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesi admin ditutup.',
  });

  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
