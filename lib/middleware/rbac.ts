/**
 * Middleware de contrôle d'accès basé sur les rôles
 * Gère la séparation entre Console Admin et Application
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  SELLER = 'seller',
  PHARMACIST = 'pharmacist',
  CUSTOMER = 'customer',
}

// Routes protégées par rôle
const ROLE_BASED_ROUTES = {
  [UserRole.SUPERADMIN]: ['/admin', '/settings', '/system'],
  [UserRole.ADMIN]: ['/admin', '/dashboard', '/management'],
  [UserRole.SUPERVISOR]: ['/dashboard', '/analytics', '/supervision'],
  [UserRole.SELLER]: ['/sales', '/inventory', '/dashboard'],
  [UserRole.PHARMACIST]: ['/medications', '/inventory', '/dashboard'],
  [UserRole.CUSTOMER]: ['/orders', '/profile', '/dashboard'],
};

// API protégées par rôle
const ADMIN_API_ROUTES = [
  '/api/admin',
  '/api/users',
  '/api/audit',
  '/api/settings',
];

const APP_API_ROUTES = [
  '/api/sales',
  '/api/medications',
  '/api/orders',
  '/api/profile',
];

/**
 * Vérifie si l'utilisateur a accès à une route
 */
export function hasAccessToRoute(userRole: UserRole, pathname: string): boolean {
  const allowedRoutes = ROLE_BASED_ROUTES[userRole] || [];
  return allowedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Vérifie si c'est une route d'administration
 */
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_API_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Vérifie si c'est une route application
 */
export function isAppRoute(pathname: string): boolean {
  return APP_API_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Middleware pour vérifier les permissions
 */
export async function checkPermissions(
  req: NextRequest,
  userRole?: UserRole
) {
  if (!userRole) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { pathname } = req.nextUrl;

  // Vérifier les routes admin
  if (isAdminRoute(pathname)) {
    const adminRoles = [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.SUPERVISOR];
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
  }

  // Vérifier les routes application
  if (isAppRoute(pathname)) {
    const appRoles = [
      UserRole.SELLER,
      UserRole.PHARMACIST,
      UserRole.CUSTOMER,
      UserRole.SUPERVISOR,
      UserRole.ADMIN,
    ];
    if (!appRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
  }

  return null; // Accès autorisé
}
