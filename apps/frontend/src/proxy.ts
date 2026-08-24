import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (request.nextUrl.pathname.startsWith('/about')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Prevent logged in users from seeing auth pages
  if (['/login', '/signup', '/verify'].some(path => request.nextUrl.pathname.startsWith(path))) {
    if (token) {
      return NextResponse.redirect(new URL('/about', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/about', '/login', '/signup', '/verify'],
};
