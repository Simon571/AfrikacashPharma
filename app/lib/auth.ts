import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Utilisateurs par défaut en mémoire (fallback si BD est indisponible)
const DEFAULT_USERS = [
  { id: 'admin-1', username: 'admin', password: 'Admin123!', role: 'admin' },
  { id: 'seller-1', username: 'vendeur', password: 'vendeur123', role: 'seller' },
  { id: 'superadmin-1', username: 'superadmin', password: 'SuperAdmin123!', role: 'admin' }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 authorize() appelé avec credentials:', { username: credentials?.username, password: credentials?.password ? '***' : 'undefined' });
        
        if (!credentials?.username || !credentials.password) {
          console.log('❌ Credentials manquants');
          return null;
        }
        
        const inputUsername = credentials.username.trim();
        const inputPassword = String(credentials.password).trim();
        
        try {
          // Étape 1: Essayer avec Prisma (Base de données)
          try {
            console.log('🔍 Recherche de l\'utilisateur dans Prisma:', inputUsername);
            const user = await Promise.race([
              prisma.user.findUnique({
                where: { username: inputUsername }
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout BD')), 5000)
              )
            ]);
            
            if (user) {
              console.log('✅ Utilisateur trouvé dans Prisma');
              
              const passwordOk = await bcrypt.compare(inputPassword, (user as any).passwordHash);
              console.log('🔑 Vérification du mot de passe Prisma:', passwordOk ? '✅ OK' : '❌ FAIL');
              
              if (passwordOk) {
                const result = { id: (user as any).id, name: (user as any).username, role: (user as any).role };
                console.log('✅ Authentification Prisma réussie');
                return result;
              }
            } else {
              console.log('ℹ️ Utilisateur non trouvé dans Prisma, essai des utilisateurs par défaut');
            }
          } catch (dbError) {
            console.warn('⚠️ Erreur Prisma, utilisation des utilisateurs par défaut:', dbError);
          }
          
          // Étape 2: Utiliser les utilisateurs par défaut (fallback)
          console.log('🔍 Recherche de l\'utilisateur dans les utilisateurs par défaut');
          const defaultUser = DEFAULT_USERS.find(u => u.username === inputUsername);
          
          if (!defaultUser) {
            console.log('❌ Utilisateur non trouvé:', inputUsername);
            return null;
          }
          
          console.log('✅ Utilisateur trouvé dans les utilisateurs par défaut');
          
          // Vérification du mot de passe directe (en développement)
          const passwordMatch = defaultUser.password === inputPassword;
          console.log('🔑 Vérification du mot de passe (direct):', passwordMatch ? '✅ OK' : '❌ FAIL');
          
          if (!passwordMatch) {
            console.log('❌ Mot de passe invalide');
            return null;
          }
          
          const result = { id: defaultUser.id, name: defaultUser.username, role: defaultUser.role };
          console.log('✅ Authentification réussie (utilisateur par défaut)');
          return result;
          
        } catch (error) {
          console.error('❌ Erreur dans authorize():', error);
          return null;
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).id = (user as any).id
        ;(token as any).username = (user as any).name || (user as any).username
        ;(token as any).role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = (token as any).id as string
        ;(session.user as any).username = (token as any).username as string
        ;(session.user as any).role = (token as any).role as string
      }
      return session
    }
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
};
