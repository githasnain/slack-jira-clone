import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

console.log('🔧 Initializing NextAuth configuration...');

export const authOptions = {
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

          // Check if user is active
          if (!user.isActive) {
            console.log('❌ User inactive:', email);
            return null;
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            console.log('❌ Account locked:', email);
            return null;
          }

          // Verify password
          if (!user.password) {
            console.log('❌ No password set for user:', email);
            return null;
          }

          // Validate password format before comparison
          if (typeof user.password !== 'string' || user.password.length !== 60 || !user.password.startsWith('$2')) {
            console.log('❌ Invalid password format for user:', email, 'Length:', user.password?.length, 'Starts with $2:', user.password?.startsWith('$2'));
            return null;
          }

          // Additional validation for bcrypt comparison
          if (typeof password !== 'string' || password.length === 0) {
            console.log('❌ Invalid password for comparison:', typeof password, 'Length:', password?.length);
            return null;
          }

          // Ensure both values are strings and not empty
          const cleanPassword = String(password).trim();
          const cleanHash = String(user.password).trim();
          
          if (cleanPassword.length === 0 || cleanHash.length === 0) {
            console.log('❌ Empty password or hash after cleaning');
            return null;
          }

          let isPasswordValid = false;
          try {
            // Ensure both parameters are strings for bcrypt comparison
            const passwordStr = String(cleanPassword);
            const hashStr = String(cleanHash);
            
            // Additional validation for bcrypt format
            if (!hashStr.startsWith('$2')) {
              console.log('❌ Invalid bcrypt hash format');
              return null;
            }
            
            isPasswordValid = await bcrypt.compare(passwordStr, hashStr);
          } catch (bcryptError) {
            console.log('❌ Bcrypt comparison error:', bcryptError instanceof Error ? bcryptError.message : String(bcryptError));
            console.log('Password type:', typeof cleanPassword, 'Length:', cleanPassword?.length);
            console.log('Hash type:', typeof cleanHash, 'Length:', cleanHash?.length);
            console.log('Password preview:', cleanPassword.substring(0, 10) + '...');
            console.log('Hash preview:', cleanHash.substring(0, 10) + '...');
            console.log('Hash starts with $2:', cleanHash.startsWith('$2'));
            return null;
          }

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