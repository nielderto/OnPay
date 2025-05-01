// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define which routes you want the middleware to run on
export const config = {
  matcher: ['/', '/homepage', '/login', '/send', '/receive', '/topup', '/dashboard/:path*'], // Add all protected routes
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
      pathname.startsWith('/topup')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Prevent authenticated users from accessing login page
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/homepage', request.url));
  }

  return NextResponse.next();
}
