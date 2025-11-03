/**
 * API endpoint pour gérer les abonnements
 * GET /api/admin/subscriptions
 * POST /api/admin/subscriptions/[id]/renew
 */

import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription.service';

async function verifySuperAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('Authorization');
  return !!token;
}

/**
 * Récupère les abonnements expirés et qui expirent bientôt
 * GET /api/admin/subscriptions?status=expiring
 */
export async function GET(req: NextRequest) {
  try {
    const isSuperAdmin = await verifySuperAdmin(req);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    if (status === 'expiring') {
      const subscriptions = await subscriptionService.getExpiringSubscriptions(2);
      return NextResponse.json({ subscriptions });
    } else if (status === 'expired') {
      const subscriptions = await subscriptionService.getExpiredSubscriptions();
      return NextResponse.json({ subscriptions });
    }

    return NextResponse.json({ subscriptions: [] });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
