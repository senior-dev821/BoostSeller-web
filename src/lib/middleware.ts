import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const origin = req.headers.get('origin');

  const isDev = process.env.NODE_ENV === 'development';
  const isFromLocalFrontend = origin === 'http://localhost:3000';
  const isApiRequest = pathname.startsWith('/api/');

  // 1️⃣ Allow public pages
  const publicPaths = ['/login', '/errorEmpty'];
  if (publicPaths.includes(pathname)) return NextResponse.next();

  // 2️⃣ Bypass auth check for localhost frontend API calls (dev only)
  if (isDev && isApiRequest && isFromLocalFrontend) {
    return NextResponse.next();
  }

  // 3️⃣ No token → redirect
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // 4️⃣ RBAC
    if (pathname.startsWith('/admin') && decoded.role !== 'super') {
      return NextResponse.redirect(new URL('/error-404', req.url));
    }

    return NextResponse.next();

  } catch (err) {
    console.error("JWT Verification Error:", err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'], // Protect only these paths
};
