
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  const performers = await prisma.performer.findMany({
    include: {
      user: true,
      group: true,
    },
  });

  const setting = await prisma.setting.findFirst();
  const assignPeriod = setting!.assignPeriod;

  const rankedPerformers = performers
    .map(performer => {
      const acceptedCount = performer.acceptedCount;
      const completedCount = performer.completedCount;
      const assignedCount = performer.assignedCount;
      const avgResponseTime = performer.avgResponseTime;
      const conversion = acceptedCount === 0
        ? 0
        : completedCount / acceptedCount;
      const responseSpeed = avgResponseTime === 0 
        ? 0
        : 1 - (avgResponseTime / assignPeriod);
      const acceptanceRatio = assignedCount === 0
        ? 0
        : acceptedCount / assignedCount;
      const score = (conversion * 0.6) + (responseSpeed * 0.2) + (acceptanceRatio * 0.2);
      const groupName = performer.group?.name;
      return { ...performer, score, groupName };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.createdAt.getTime() - b.createdAt.getTime();
    })
    .map((performer, index) => ({
      ...performer,
      groupRank: index + 1 // 👈 Assign rank starting from 1
    }));
    console.log(rankedPerformers);
  return NextResponse.json(rankedPerformers);
}
