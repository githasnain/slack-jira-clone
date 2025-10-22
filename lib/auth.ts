import 'dotenv/config';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);

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
          // For now, use hardcoded credentials for testing
          if (credentials.email === 'admin@slackclone.com' && credentials.password === 'admin123') {
            return {
              id: '1',
              email: 'admin@slackclone.com',
              name: 'Admin User',
              role: 'ADMIN',
            };
          }
          
          if (credentials.email === 'sarah@slackclone.com' && credentials.password === 'sarah123') {
            return {
              id: '2',
              email: 'sarah@slackclone.com',
              name: 'Sarah Johnson',
              role: 'MEMBER',
            };
          }
          
          if (credentials.email === 'john@slackclone.com' && credentials.password === 'john123') {
            return {
              id: '3',
              email: 'john@slackclone.com',
              name: 'John Doe',
              role: 'MEMBER',
            };
          }

          return null;
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