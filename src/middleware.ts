import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Fast path for static assets
    if (req.nextUrl.pathname.startsWith('/_next/static') || 
        req.nextUrl.pathname.startsWith('/favicon.ico')) {
      return NextResponse.next()
    }
    
    // If user is not authenticated and trying to access protected route
    if (!req.nextauth.token && !req.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Fast path for static assets
        if (req.nextUrl.pathname.startsWith('/_next/static') || 
            req.nextUrl.pathname.startsWith('/favicon.ico')) {
          return true
        }
        
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true
        }
        // Require token for all other routes
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ]
}
