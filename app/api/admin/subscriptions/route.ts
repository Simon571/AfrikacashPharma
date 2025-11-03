import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const subscriptions = await prisma.subscription.findMany({ include: { instance: true } });
  return NextResponse.json({ subscriptions });
}

export async function POST(req: Request) {
  const body = await req.json();
  const subscription = await prisma.subscription.create({
    data: {
      planType: body.planType,
      planName: body.planName,
      status: body.status || 'active',
      startDate: body.startDate || new Date(),
      endDate: body.endDate,
      billingCycle: body.billingCycle,
      amount: body.amount || 0,
      currency: body.currency || 'EUR',
      paymentMethod: body.paymentMethod,
    },
  });
  return NextResponse.json({ subscription });
}
