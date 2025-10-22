/**
 * Combined middleware for authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './authMiddleware';
import { roleMiddleware } from './roleMiddleware';

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

  // Apply authentication middleware
  const authResponse = await authMiddleware(req);
  if (authResponse) {
    return authResponse;
  }

  // Apply role-based authorization middleware
  const roleResponse = await roleMiddleware(req);
  if (roleResponse) {
    return roleResponse;
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
