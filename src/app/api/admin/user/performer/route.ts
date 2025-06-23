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
    let interestIds: number[] = [];

    if (currentUser.role === 'admin') {
      whereCondition = { adminId: currentUser.id };

      // Get interests that belong to this admin
      const interests = await prisma.interest.findMany({
        where: { adminId: currentUser.id },
        select: { id: true },
      });
      interestIds = interests.map((i) => i.id);
    } else if (currentUser.role !== 'super') {
      return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 });
    }

    const performers = await prisma.performer.findMany({
      where: whereCondition,
      include: {
        user: true,
      },
    });

    // Filter groups based on interestIds if role is admin, otherwise get all
    const groups = await prisma.group.findMany({
      where: currentUser.role === 'admin' ? { interestId: { in: interestIds } } : undefined,
    });

    const groupMap = new Map(groups.map(group => [group.id, group.name]));
   
    const rankedPerformers = performers
      .map(performer => {
        let score;
        const {
          acceptedCount,
          completedCount,
          assignedCount,
          avgResponseTime,
          groupIds,
        } = performer;

        const conversion = acceptedCount === 0 ? 0 : completedCount / acceptedCount;
        const responseSpeed = avgResponseTime === 0
              ? 0
              : 1 / avgResponseTime;
        const acceptanceRatio = assignedCount === 0 ? 0 : acceptedCount / assignedCount;
        if (performer.assignedCount === 0) {
          score = 0;
        } else {
           score = (conversion * 0.6) + (responseSpeed * 0.2) + (acceptanceRatio * 0.2);
        }
       
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
