import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminSecret,
  createAdminSessionToken,
  validateAdminSessionToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/server/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const secret = body?.secret;

    if (!secret || typeof secret !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Kunci rahasia wajib diisi.' },
        { status: 400 }
      );
    }

    // Artificial short delay to prevent timing / brute force enumeration
    await new Promise((r) => setTimeout(r, 400));

    const isValid = verifyAdminSecret(secret);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Kunci rahasia tidak valid.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
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
