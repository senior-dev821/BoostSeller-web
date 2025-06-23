// pages/api/admin/statistics/worktraffic.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { eachDayOfInterval, format, getHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = new Date(searchParams.get("from") || "");
  const to = new Date(searchParams.get("to") || "");
  const clientTimezone = searchParams.get("tz") || "Asia/Bangkok";

  const currentUser = await getUserFromToken();

  if (!currentUser) {
    return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
  }

  const hostesses = await prisma.hostess.findMany({
    where: { adminId: currentUser.id },
    select: { id: true },
  });
  const hostessIds = hostesses.map(h => h.id);

  const interests = await prisma.interest.findMany({
    where: { adminId: currentUser.id },
    select: { id: true },
  });
  const interestIds = interests.map(i => i.id);

  const leads = await prisma.lead.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    select: { createdAt: true },
  });

  const days = eachDayOfInterval({ start: from, end: to });
  const heatmap = days.map((day) => {
    const hours = new Array(24).fill(0);
    for (const lead of leads) {
      const zoned = toZonedTime(lead.createdAt, clientTimezone);
      if (format(zoned, "yyyy-MM-dd") === format(toZonedTime(day, clientTimezone), "yyyy-MM-dd")) {
        const hour = getHours(zoned);
        hours[hour]++;
      }
    }
    return {
      date: format(toZonedTime(day, clientTimezone), "yyyy-MM-dd"),
      hours,
    };
  });

  const performers = await prisma.performer.findMany({
    where: { adminId: currentUser.id },
  });
  const availablePerformers = performers.filter(
    (p) => p.available && p.acceptedCount - (p.closedCount + p.completedCount) < p.assignedCount
  );

  const allGroups = await prisma.group.findMany({
    where: { interestId: { in: interestIds } },
  });
  const groupStatus = allGroups.map((group) => {
    const hasAvailable = availablePerformers.some((p) => p.groupIds.includes(group.id));
    return {
      name: group.name,
      hasAvailablePerformer: hasAvailable,
    };
  });

  const now = new Date();
  const skipped = await prisma.lead.count({
    where: {
      status: "pendding",
      addedBy: { in: hostessIds },
    },
  });
  const unresponsive = await prisma.lead.count({
    where: {
      status: { notIn: ["closed", "completed"] },
      addedBy: { in: hostessIds },
      updatedAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    },
  });

  return NextResponse.json({
    heatmap,
    groupStatus,
    riskCounts: { skipped, unresponsive },
  });
}
