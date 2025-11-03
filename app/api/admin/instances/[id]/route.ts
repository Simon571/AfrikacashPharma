/**
 * API endpoint pour gérer une instance spécifique
 * GET/PATCH/DELETE /api/admin/instances/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { InstanceService } from '@/lib/services/instance.service';
import { UpdateInstanceRequest } from '@/types/multi-tenant';

const instanceService = new InstanceService();

async function verifySuperAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('Authorization');
  return !!token;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const isSuperAdmin = await verifySuperAdmin(req);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instance = await instanceService.getInstance(resolvedParams.id);

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error('Error fetching instance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const isSuperAdmin = await verifySuperAdmin(req);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateInstanceRequest = await req.json();
    const instance = await instanceService.updateInstance(resolvedParams.id, body);

    return NextResponse.json(instance);
  } catch (error) {
    console.error('Error updating instance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const isSuperAdmin = await verifySuperAdmin(req);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await instanceService.deleteInstance(resolvedParams.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting instance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
