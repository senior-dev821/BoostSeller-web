import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

function formatCategory(date: Date, view: 'daily' | 'weekly' | 'monthly', locale: string): string {
  if (view === 'daily') {
    return date.toLocaleDateString(locale, { day: '2-digit' }); // "17"
  } else if (view === 'weekly') {
    const monthAbbr = date.toLocaleString(locale, { month: 'short' });
    const weekNum = Math.ceil(date.getDate() / 7);
    return `${monthAbbr}-${weekNum}`; // "Jun-3"
  } else {
    return date.toLocaleString(locale, { month: 'short' }); // "Jun"
  }
}

function getDateRanges(view: 'daily' | 'weekly' | 'monthly'): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: Date[] = [];

  if (view === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d);
    }
  } else if (view === 'weekly') {
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    for (let i = 4; i >= 0; i--) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() - i * 7);
      dates.push(d);
    }
  } else {
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      dates.push(d);
    }
  }
  return dates;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const view = body.view as 'daily' | 'weekly' | 'monthly';
    const timezoneOffset = body.timezoneOffset ?? 0; // in minutes
    const locale = body.locale ?? 'en-US';

    if (!view || !['daily', 'weekly', 'monthly'].includes(view)) {
      return NextResponse.json({ error: "Invalid view type" }, { status: 400 });
    }

    const currentUser = await getUserFromToken();
    if (!currentUser) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
    }

    const setting = await prisma.setting.findFirst({
      where: { adminId: currentUser.id },
    });

    const SLA_SECONDS = setting?.slaTarget ?? 120;

    const ranges = getDateRanges(view);
    const tzOffsetMs = timezoneOffset * 60 * 1000;

    const categories: string[] = [];
    const avgResponseTimes: number[] = [];
    const slaComplianceRates: number[] = [];

    let totalResponseTimeSum = 0;
    let totalResponseCount = 0;
    let totalSlaCompliantCount = 0;

    for (let i = 0; i < ranges.length; i++) {
      let startDate: Date;
      let endDate: Date;

      if (view === 'daily') {
        startDate = new Date(ranges[i]);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (view === 'weekly') {
        startDate = new Date(ranges[i]);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(ranges[i].getFullYear(), ranges[i].getMonth(), 1);
        endDate = new Date(ranges[i].getFullYear(), ranges[i].getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      // Apply timezone offset to align with user's local time
      const startUtc = new Date(startDate.getTime() - tzOffsetMs);
      const endUtc = new Date(endDate.getTime() - tzOffsetMs);

      categories.push(formatCategory(startDate, view, locale));

      const leads = await prisma.lead.findMany({
        where: {
          assignedAt: {
            gte: startUtc,
            lte: endUtc,
            not: null,
          },
          acceptedAt: {
            not: null,
          },
        },
        select: {
          assignedAt: true,
          acceptedAt: true,
        },
      });

      if (leads.length === 0) {
        avgResponseTimes.push(0);
        slaComplianceRates.push(0);
        continue;
      }

      let responseTimeSum = 0;
      let slaCompliantCount = 0;

      for (const lead of leads) {
        if (lead.assignedAt && lead.acceptedAt) {
          const diffSeconds = Math.floor((lead.acceptedAt.getTime() - lead.assignedAt.getTime()) / 1000);
          if (diffSeconds >= 0) {
            responseTimeSum += diffSeconds;
            if (diffSeconds <= SLA_SECONDS) slaCompliantCount++;
          }
        }
      }

      const avgResponse = responseTimeSum / leads.length;
      const slaRate = (slaCompliantCount / leads.length) * 100;

      avgResponseTimes.push(Number(avgResponse.toFixed(2)));
      slaComplianceRates.push(Number(slaRate.toFixed(2)));

      totalResponseTimeSum += responseTimeSum;
      totalResponseCount += leads.length;
      totalSlaCompliantCount += slaCompliantCount;
    }

    const totalAvgResponseTime =
      totalResponseCount > 0 ? Number((totalResponseTimeSum / totalResponseCount).toFixed(2)) : 0;
    const totalSlaCompliance =
      totalResponseCount > 0 ? Number(((totalSlaCompliantCount / totalResponseCount) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      categories,
      avgResponseTimes,
      slaComplianceRates,
      totalAvgResponseTime,
      totalSlaCompliance,
      slaSeconds: SLA_SECONDS,
    }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
