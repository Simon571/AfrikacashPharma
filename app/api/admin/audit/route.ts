import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 100,
    include: { user: true },
  });
  return NextResponse.json({ logs });
}
