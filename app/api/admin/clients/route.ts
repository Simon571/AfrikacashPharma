import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const clients = await prisma.client.findMany();
  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      name: body.name,
      contactEmail: body.contactEmail,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      address: body.address,
      status: 'ACTIVE',
    },
  });
  return NextResponse.json({ client });
}
