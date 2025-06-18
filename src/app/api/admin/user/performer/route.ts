

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const performers = await prisma.performer.findMany({
      include: {
        user: true,
      },
    });

    const setting = await prisma.setting.findFirst();
    const assignPeriod = setting!.assignPeriod;

    // Fetch all groups once
    const allGroups = await prisma.group.findMany();
    const groupMap = new Map(allGroups.map(group => [group.id, group.name]));

    // Add score, rank, and group names
    const rankedPerformers = performers
      .map(performer => {
        const acceptedCount = performer.acceptedCount;
        const completedCount = performer.completedCount;
        const assignedCount = performer.assignedCount;
        const avgResponseTime = performer.avgResponseTime;

        const conversion = acceptedCount === 0 ? 0 : completedCount / acceptedCount;
        const responseSpeed = avgResponseTime === 0 ? 0 : 1 - (avgResponseTime / assignPeriod);
        const acceptanceRatio = assignedCount === 0 ? 0 : acceptedCount / assignedCount;
        const score = (conversion * 0.6) + (responseSpeed * 0.2) + (acceptanceRatio * 0.2);

        // Map group IDs to names
        const groupNames = performer.groupIds.map(id => groupMap.get(id)).filter(Boolean);

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
        groupRank: index + 1, // rank
      }));

    return NextResponse.json(rankedPerformers);
  } catch (error) {
    console.error('Error fetching performers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
