import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generateLicenseKey() {
  return randomBytes(16).toString('hex').toUpperCase();
}

export async function GET() {
  const licenses = await prisma.license.findMany({ include: { client: true } });
  return NextResponse.json({ licenses });
}

export async function POST(req: Request) {
  const body = await req.json();
  const key = generateLicenseKey();
  const license = await prisma.license.create({
    data: {
      clientId: body.clientId,
      key,
      status: 'ACTIVE',
      assignedBy: body.assignedBy,
    },
  });
  return NextResponse.json({ license });
}
