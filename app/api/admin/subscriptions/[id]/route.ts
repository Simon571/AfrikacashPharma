import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await prisma.subscription.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
