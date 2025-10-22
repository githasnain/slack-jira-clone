'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    // If user is not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
      router.push('/auth/signin')
      return
    }

    // If user is authenticated and on auth pages, redirect to dashboard
    if (session && isPublicRoute) {
      router.push('/')
      return
    }
  }, [session, status, pathname, router, isPublicRoute])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we verify your authentication.</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated and on public route, show the route
  if (!session && isPublicRoute) {
    return <>{children}</>
  }

  // If user is authenticated, show the protected content
  if (session) {
    return <>{children}</>
  }

  // Fallback for unauthenticated users on protected routes (will redirect)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the login page.</p>
      </div>
    </div>
  )
}