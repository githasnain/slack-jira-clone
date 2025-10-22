import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string
            }
          });

          if (!user) {
            return null;
          }

          // Check if user is active
          if (!user.isActive) {
            return null;
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            return null;
          }

          // Verify password
          if (!user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            // Increment login attempts
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: user.loginAttempts + 1,
                lockedUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes after 5 attempts
              }
            });
            return null;
          }

          // Reset login attempts on successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date()
            }
          });

          // Log successful login
          await prisma.systemLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN_SUCCESS',
              details: `User ${user.email} logged in successfully`
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export default handler;