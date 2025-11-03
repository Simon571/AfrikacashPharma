/**
 * Configuration de la Console Afrikapharma
 * Outil d'administration et supervision
 */

export const CONSOLE_CONFIG = {
  // Identité de l'application
  APP_NAME: 'Console Afrikapharma',
  APP_TYPE: 'admin-console',
  VERCEL_PROJECT: 'console-afrikapharma',
  ENVIRONMENT: process.env.NODE_ENV || 'development',

  // URLs
  CONSOLE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  APP_URL: process.env.AFRIKAPHARMA_APP_URL || 'http://localhost:3001',

  // Rôles admin autorisés
  ADMIN_ROLES: ['superadmin', 'admin', 'supervisor'],

  // Routes protégées
  PROTECTED_ROUTES: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/sales',
    '/admin/analytics',
    '/admin/audit',
    '/admin/settings',
  ],

  // API endpoints
  API_ENDPOINTS: {
    USERS: '/api/admin/users',
    SALES: '/api/admin/sales',
    ANALYTICS: '/api/admin/analytics',
    AUDIT: '/api/admin/audit',
    STATISTICS: '/api/admin/statistics',
  },

  // Base de données
  DATABASE: {
    SHARED: true, // Partage la DB avec AfrikaPharma
    URL: process.env.DATABASE_URL,
  },

  // Authentification
  AUTH: {
    PROVIDER: 'nextauth',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },

  // Permissions
  PERMISSIONS: {
    superadmin: ['read', 'write', 'delete', 'admin'],
    admin: ['read', 'write', 'delete'],
    supervisor: ['read', 'report'],
  },
};

export default CONSOLE_CONFIG;
