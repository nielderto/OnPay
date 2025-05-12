// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define which routes you want the middleware to run on
export const config = {
  matcher: ['/', '/homepage', '/login', '/username', '/send', '/receive', '/topup', '/dashboard/:path*', '/ens-test'], // Add all protected routes
}

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isConnected')?.value === 'true';
  const { pathname } = request.nextUrl;

  // Handle root path redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(isLoggedIn ? '/homepage' : '/login', request.url));
  }

  // Protect routes that require authentication
  if (pathname.startsWith('/homepage') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/send') ||
    pathname.startsWith('/receive') ||
    pathname.startsWith('/topup') ||
    pathname.startsWith('/ens-test')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Prevent authenticated users from accessing login page
  if (pathname === '/login' && isLoggedIn) {
    // The check for having a username is now handled in the LoginLogic component
    // which will redirect to either /homepage or /username based on ENS status
    return NextResponse.redirect(new URL('/homepage', request.url));
  }

  return NextResponse.next();
}
