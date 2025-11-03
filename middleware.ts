import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public pages
    if (pathname === '/' || pathname === '/login') {
      return NextResponse.next();
    }

    // Redirect to dashboard after login if coming from login page
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard',
    '/setup',
    '/clients',
    '/totp',
    '/licenses',
    '/subscriptions',
    '/trials',
    '/audit',
  ],
};
