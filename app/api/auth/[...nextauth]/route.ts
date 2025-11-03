import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Utilisateurs par défaut
const DEFAULT_USERS = [
  { id: 'admin-1', username: 'admin', password: 'Admin123!', role: 'admin' },
  { id: 'seller-1', username: 'vendeur', password: 'vendeur123', role: 'seller' },
  { id: 'superadmin-1', username: 'superadmin', password: 'SuperAdmin123!', role: 'admin' }
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }
        
        const inputUsername = credentials.username.trim();
        const inputPassword = String(credentials.password).trim();
        
        try {
          // Essayer Prisma d'abord
          try {
            const user = await Promise.race([
              prisma.user.findUnique({
                where: { username: inputUsername }
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ]);
            
            if (user) {
              const passwordOk = await bcrypt.compare(inputPassword, (user as any).passwordHash);
              if (passwordOk) {
                return { 
                  id: (user as any).id, 
                  name: (user as any).username, 
                  email: `${(user as any).username}@pharma.local`,
                  role: (user as any).role 
                };
              }
            }
          } catch {
            // Fallback
          }
          
          // Fallback: utilisateurs par défaut
          const defaultUser = DEFAULT_USERS.find(u => u.username === inputUsername);
          if (!defaultUser) return null;
          
          if (defaultUser.password === inputPassword) {
            return { 
              id: defaultUser.id, 
              name: defaultUser.username,
              email: `${defaultUser.username}@pharma.local`,
              role: defaultUser.role 
            };
          }
          
          return null;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).id = (user as any).id;
        ;(token as any).username = (user as any).name;
        ;(token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = (token as any).id;
        ;(session.user as any).username = (token as any).username;
        ;(session.user as any).role = (token as any).role;
      }
      return session;
    }
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
});

export const GET = handler;
export const POST = handler;
