import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const trial = await prisma.trialManagement.findUnique({ where: { id: params.id } });
  if (!trial || trial.extensionsGranted >= trial.maxExtensions) {
    return NextResponse.json({ error: 'Extension non autorisée' }, { status: 400 });
  }
  const updated = await prisma.trialManagement.update({
    where: { id: params.id },
    data: {
      remainingDays: trial.remainingDays + 7,
      extensionsGranted: trial.extensionsGranted + 1,
    },
  });
  return NextResponse.json({ trial: updated });
}
