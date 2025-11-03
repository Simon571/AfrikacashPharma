/**
 * API endpoint pour les actions spécifiques sur les instances
 * POST /api/admin/instances/[id]/suspend
 * POST /api/admin/instances/[id]/reactivate
 */

import { NextRequest, NextResponse } from 'next/server';
import { InstanceService } from '@/lib/services/instance.service';

const instanceService = new InstanceService();

async function verifySuperAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('Authorization');
  return !!token;
}

/**
 * Suspend une instance
 * POST /api/admin/instances/[id]/suspend
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const resolvedParams = await params;
    const isSuperAdmin = await verifySuperAdmin(req);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const action = resolvedParams.action;
    const body = await req.json().catch(() => ({}));

    if (action === 'suspend') {
      const instance = await instanceService.suspendInstance(
        resolvedParams.id,
        body.reason
      );
      return NextResponse.json(instance);
    } else if (action === 'reactivate') {
      const instance = await instanceService.reactivateInstance(resolvedParams.id);
      return NextResponse.json(instance);
    } else {
      return NextResponse.json(
        { error: 'Unknown action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error performing action:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
