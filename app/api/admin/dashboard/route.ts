import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const totalClients = await prisma.client.count({ where: { status: 'ACTIVE' } });
  const totalLicenses = await prisma.license.count();
  const trialLicenses = await prisma.license.count({ where: { status: 'ACTIVE', expiresAt: null } });
  const paidLicenses = await prisma.license.count({ where: { status: 'ACTIVE', expiresAt: { not: null } } });
  const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true } });
  const monthlyRevenue = await prisma.payment.groupBy({
    by: ['currency'],
    _sum: { amount: true },
    where: { paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
  });
  return NextResponse.json({
    totalClients,
    totalLicenses,
    trialLicenses,
    paidLicenses,
    totalRevenue: totalRevenue._sum.amount || 0,
    monthlyRevenue,
  });
}
