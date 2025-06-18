import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // 1️⃣ Allow unauthenticated access to public routes
  const publicPaths = ['/login', '/errorEmpty'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 2️⃣ Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // 3️⃣ RBAC: Protect /admin routes to 'super' role only
    if (pathname.startsWith('/admin') && decoded.role !== 'super') {
      return NextResponse.redirect(new URL('/error-404', req.url));
    }

    // ✅ Authenticated and authorized → continue
    return NextResponse.next();

  } catch (err) {
    console.error("JWT Verification Error:", err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'], // Protect only these paths
};
