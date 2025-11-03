import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const medications = await prisma.medication.findMany({
      include: {
        stockMovements: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(medications);
  } catch (error) {
    console.error('Erreur API inventaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
