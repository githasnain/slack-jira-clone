import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

console.log('🔧 Initializing NextAuth configuration...', new Date().toISOString());

export const authOptions = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 8 * 60 * 60, // 8 hours (configurable via environment)
    updateAge: 30 * 60, // 30 minutes
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 AUTHORIZE FUNCTION CALLED');
        console.log('🔍 Credentials received:', credentials);
        console.log('🔍 NextAuth authorize called with:', {
          credentialsType: typeof credentials,
          credentialsKeys: credentials ? Object.keys(credentials) : 'null',
          emailType: typeof credentials?.email,
          passwordType: typeof credentials?.password,
          emailValue: credentials?.email,
          passwordValue: credentials?.password ? '[REDACTED]' : 'null'
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials:', { email: !!credentials?.email, password: !!credentials?.password });
          return null;
        }

        try {
          // Validate credentials
          const email = credentials.email as string;
          const password = credentials.password as string;
          
          if (typeof email !== 'string' || typeof password !== 'string') {
            console.log('❌ Invalid credential types:', { email: typeof email, password: typeof password });
            return null;
          }

          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: email
            }
          });

          if (!user) {
            console.log('❌ User not found:', email);
            return null;
          }

          // Verify password
          if (!user.password) {
            console.log('❌ No password set for user:', email);
            return null;
          }
          
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            console.log('❌ Invalid password for user:', email);
            return null;
          }

          console.log('✅ User authenticated successfully:', { id: user.id, email: user.email, role: user.role });

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      try {
        if (token) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.email = token.email as string;
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return null;
      }
    }
  },
  events: {
    async signOut({ token }: any) {
      console.log('🔓 User signed out:', token?.email);
    },
    async session({ session }: any) {
      // Check if session is expired
      if (session?.expires && new Date(session.expires) < new Date()) {
        console.log('⏰ Session expired');
        return null;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };