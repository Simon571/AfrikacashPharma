import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const body = await req.json();
  const license = await prisma.license.update({
    where: { id: params.id },
    data: { status: body.status },
  });
  return NextResponse.json({ license });
}
