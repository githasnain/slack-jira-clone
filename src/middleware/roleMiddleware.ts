/**
 * Role-based authorization middleware
 * Checks user roles and restricts access to admin-only routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function roleMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;
  
  // Admin-only routes
  const adminRoutes = [
    '/dashboard/users',
    '/dashboard/projects/create',
    '/dashboard/admin',
    '/api/admin',
  ];

  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (!isAdminRoute) {
    return null; // Allow non-admin routes to continue
  }

  // Check user role
  const token = await getToken({ req });
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token.role !== 'ADMIN') {
    // Redirect non-admin users to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return null; // Allow admin request to continue
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'ADMIN';
}

export function isMember(userRole: string): boolean {
  return ['ADMIN', 'MEMBER'].includes(userRole);
}

export function canAccessProject(userRole: string, projectRole?: string): boolean {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'MEMBER' && projectRole) return true;
  return false;
}
