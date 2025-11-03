import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'ENTRY' | 'EXIT' | 'CORRECTION' | null;

    const movements = await prisma.stockMovement.findMany({
      where: type ? { type } : undefined,
      include: {
        medication: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Erreur API mouvements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des mouvements' },
      { status: 500 }
    );
  }
}
