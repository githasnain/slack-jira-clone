import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

// Role-based middleware for protecting routes
export async function withRoleAuth(
  request: NextRequest,
  allowedRoles: string[],
  redirectTo: string = '/auth/signin'
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true }
    })

    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return null // Allow access
  } catch (error) {
    console.error('Role middleware error:', error)
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }
}

// Admin-only middleware
export async function withAdminAuth(request: NextRequest) {
  return await withRoleAuth(request, ['ADMIN'])
}

// Member or Admin middleware
export async function withMemberAuth(request: NextRequest) {
  return await withRoleAuth(request, ['MEMBER', 'ADMIN'])
}

// Check if user has specific role
export async function hasRole(userId: string, role: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    return user?.role === role
  } catch (error) {
    console.error('Role check error:', error)
    return false
  }
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  return await hasRole(userId, 'ADMIN')
}

// Check if user is member or admin
export async function isUserMemberOrAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    return user?.role === 'MEMBER' || user?.role === 'ADMIN'
  } catch (error) {
    console.error('Member/Admin check error:', error)
    return false
  }
}
