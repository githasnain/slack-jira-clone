/**
 * Main middleware file
 * Handles authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth/session')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  const publicRoutes = [
    '/login',
    '/register',
    '/signup',
    '/signin',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = await getToken({ req });
  
  if (!token) {
    // Redirect to login page
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes
  const adminRoutes = [
    '/dashboard/users',
    '/dashboard/projects/create',
    '/dashboard/admin',
    '/api/admin',
  ];

  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (isAdminRoute && token.role !== 'ADMIN') {
    // Redirect non-admin users to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};