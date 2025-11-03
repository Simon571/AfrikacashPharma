import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const body = await req.json();
  const trial = await prisma.trialManagement.update({
    where: { id: params.id },
    data: {
      isBlocked: true,
      blockReason: body.reason || 'Blocage manuel',
    },
  });
  return NextResponse.json({ trial });
}
