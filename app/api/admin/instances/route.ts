/**
 * API endpoint pour créer une nouvelle instance
 * POST /api/admin/instances
 */

import { NextRequest, NextResponse } from 'next/server';
import { InstanceService } from '@/lib/services/instance.service';
import { CreateInstanceRequest } from '@/types/multi-tenant';
import { prisma } from '@/lib/prisma';

const instanceService = new InstanceService();

// Vérifier que l'utilisateur est super-admin
async function verifySuperAdmin(req: NextRequest): Promise<boolean> {
  // TODO: Implémenter la vérification JWT/Session
  // Pour dev: accepter les requêtes
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier les permissions
    const isSuperAdmin = await verifySuperAdmin(req);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parser la requête
    const body: CreateInstanceRequest = await req.json();

    // Valider les données
    if (!body.name || !body.subdomain || !body.ownerEmail || !body.planType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subdomain, ownerEmail, planType' },
        { status: 400 }
      );
    }

    console.log('Creating instance with:', body);

    // Créer une instance minimale pour le dev (sans Vercel)
    const subscription = await prisma.subscription.create({
      data: {
        planType: body.planType,
        planName: `${body.planType} Plan`,
        status: 'ACTIVE',
        amount: 0,
        currency: 'EUR',
      },
    });

    const instance = await prisma.instance.create({
      data: {
        name: body.name,
        subdomain: body.subdomain,
        ownerName: body.ownerName || body.ownerEmail.split('@')[0],
        ownerEmail: body.ownerEmail,
        ownerPhone: body.ownerPhone,
        subscriptionId: subscription.id,
        status: 'active',
        apiKey: `key_${Math.random().toString(36).substr(2, 9)}`,
      },
      include: {
        subscription: true,
        settings: true,
      },
    });

    console.log('Instance created:', instance);
    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    console.error('Error creating instance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Full error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Récupère les instances avec filtrage
 * GET /api/admin/instances?status=active&planType=trial
 */
export async function GET(req: NextRequest) {
  try {
    const isSuperAdmin = await verifySuperAdmin(req);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const planType = url.searchParams.get('planType');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const result = await instanceService.listInstances({
      status: status || undefined,
      planType: planType || undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing instances:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
