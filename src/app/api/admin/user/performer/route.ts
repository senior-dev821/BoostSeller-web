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

    const performers = await prisma.performer.findMany({
      where: whereCondition,
      include: {
        user: true,
      },
    });

    const allGroups = await prisma.group.findMany();
    const groupMap = new Map(allGroups.map(group => [group.id, group.name]));

    const rankedPerformers = performers
      .map(performer => {
        const {
          acceptedCount,
          completedCount,
          assignedCount,
          avgResponseTime,
          groupIds,
        } = performer;

        const conversion = acceptedCount === 0 ? 0 : completedCount / acceptedCount;
        const responseSpeed = avgResponseTime === 0 ? 0 : 1 / avgResponseTime;
        const acceptanceRatio = assignedCount === 0 ? 0 : acceptedCount / assignedCount;
        const score = (conversion * 0.6) + (responseSpeed * 0.2) + (acceptanceRatio * 0.2);

        const groupNames = groupIds.map(id => groupMap.get(id)).filter(Boolean);

        return {
          ...performer,
          score,
          groupNames,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .map((performer, index) => ({
        ...performer,
        groupRank: index + 1,
      }));

    return NextResponse.json(rankedPerformers);
  } catch (error) {
    console.error('Error fetching performers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
