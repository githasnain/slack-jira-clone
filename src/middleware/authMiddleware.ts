/**
 * Authentication middleware
 * Checks if user is logged in and redirects to login if not
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function authMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;
  
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
    return null; // Allow request to continue
  }

  // Check for authentication token
  const token = await getToken({ req });
  
  if (!token) {
    // Redirect to login page
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return null; // Allow authenticated request to continue
}
