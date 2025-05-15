// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/', '/homepage', '/send', '/receive', '/topup', '/dashboard/:path*', '/ens-test', '/username'],
}

export async function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isConnected')?.value === 'true';
  const { pathname } = request.nextUrl;

  // If not logged in, redirect to root
  if (!isLoggedIn) {
    if (pathname !== '/') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If logged in and on root, redirect to homepage
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/homepage', request.url));
  }

  // Get the user's address from the cookie
  const address = request.cookies.get('walletAddress')?.value;
  
  if (address) {
    try {
      // Check if user has an ENS name using the gateway API
      const response = await fetch(`https://ens-gateway.onpaylisk.workers.dev/api/ens-lookup/${address}`);
      const data = await response.json();
      const hasENSName = Boolean(data.name);
      
      // If no ENS name and not on username page, redirect to username page
      if (!hasENSName && pathname !== '/username') {
        return NextResponse.redirect(new URL('/username', request.url));
      }
      
      // If has ENS name and on username page, redirect to homepage
      if (hasENSName && pathname === '/username') {
        return NextResponse.redirect(new URL('/homepage', request.url));
      }
    } catch (error) {
      console.error('Error checking ENS name:', error);
      // If there's an error checking ENS name, allow access to username page
      if (pathname !== '/username') {
        return NextResponse.redirect(new URL('/username', request.url));
      }
    }
  }

  return NextResponse.next();
}
