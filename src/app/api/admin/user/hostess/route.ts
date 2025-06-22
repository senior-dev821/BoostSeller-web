import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const currentUser = await getUserFromToken();

    if (!currentUser) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    let whereCondition = {};

    if (currentUser.role === 'admin') {
      whereCondition = {
        adminId: currentUser.id,
      };
    } else if (currentUser.role !== 'super') {
      return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 });
    }

    const hostesses = await prisma.hostess.findMany({
      where: whereCondition,
      include: {
        user: true,
        lead: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(hostesses);
  } catch (error) {
    console.error('Error fetching hostesses:', error);
    return NextResponse.json({ error: true, message: 'Internal server error' }, { status: 500 });
  }
}
