import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const trials = await prisma.trialManagement.findMany({ include: { user: true } });
  return NextResponse.json({ trials });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const trial = await prisma.trialManagement.update({
    where: { id: body.id },
    data: body.data,
  });
  return NextResponse.json({ trial });
}
