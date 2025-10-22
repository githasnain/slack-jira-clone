import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Fix for NextAuth.js CLIENT_FETCH_ERROR
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

