// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/', '/homepage', '/send', '/receive', '/topup', '/dashboard/:path*', '/ens-test'],
}

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isConnected')?.value === 'true';
  const { pathname } = request.nextUrl;

  // ✅ Redirect from root to homepage if logged in
  if (pathname === '/' && isLoggedIn) {
    return NextResponse.redirect(new URL('/homepage', request.url));
  }

  // ✅ Protect pages
  const protectedRoutes = [
    '/homepage',
    '/dashboard',
    '/send',
    '/receive',
    '/topup',
    '/ens-test',
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
