import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Helper to format dates based on view type
function formatCategory(date: Date, view: 'daily' | 'weekly' | 'monthly'): string {
  if (view === 'daily') {
    // dd
    return date.getDate().toString().padStart(2, '0');
  } else if (view === 'weekly') {
    // Example: "Mar-2" => month abbrev + week number in month
    const monthAbbr = date.toLocaleString('en-US', { month: 'short' }); // Mar
    // Calculate week of month: week starts on Sunday, adjust accordingly
    const day = date.getDate();
    const weekNum = Math.ceil(day / 7);
    return `${monthAbbr}-${weekNum}`;
  } else {
    // monthly: 3-letter month
    return date.toLocaleString('en-US', { month: 'short' }); // Jan, Feb
  }
}

// Helper to get date ranges based on view
function getDateRanges(view: 'daily' | 'weekly' | 'monthly'): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize time

  const dates = [];
  if (view === 'daily') {
    // last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d);
    }
  } else if (view === 'weekly') {
    // last 5 weeks: weekly intervals start Sunday
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay()); // go to last Sunday

    for (let i = 4; i >= 0; i--) {
      const d = new Date(currentSunday);
      d.setDate(currentSunday.getDate() - i * 7);
      dates.push(d);
    }
  } else {
    // monthly - last 12 months including current
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
		
    if (!view || !['daily', 'weekly', 'monthly'].includes(view)) {
      return NextResponse.json({ error: "Invalid view type" }, { status: 400 });
    }

    // Constants for SLA - define your SLA time in seconds here
		const setting = await prisma.setting.findFirst();

    let SLA_SECONDS = 120; // e.g., 2 minutes
		if(setting)
		{
			SLA_SECONDS = setting.slaTarget;
		}
    // Get the date ranges based on view
    const ranges = getDateRanges(view);
    // Prepare response arrays
    const categories: string[] = [];
    const avgResponseTimes: number[] = [];
    const slaComplianceRates: number[] = [];

    // For total calculation
    let totalResponseTimeSum = 0;
    let totalResponseCount = 0;
    let totalSlaCompliantCount = 0;

    // Loop over each range and fetch data for that period
    for (let i = 0; i < ranges.length; i++) {
      let startDate: Date;
      let endDate: Date;

      if (view === 'daily') {
        startDate = new Date(ranges[i]);
        endDate = new Date(ranges[i]);
        endDate.setHours(23, 59, 59, 999);
      } else if (view === 'weekly') {
        startDate = new Date(ranges[i]);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // monthly
        startDate = new Date(ranges[i].getFullYear(), ranges[i].getMonth(), 1);
        endDate = new Date(ranges[i].getFullYear(), ranges[i].getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      categories.push(formatCategory(startDate, view));

      // Query leads assigned in this period with acceptedAt and assignedAt (both not null)
      const leads = await prisma.lead.findMany({
				where: {
					assignedAt: {
						gte: startDate,
						lte: endDate,
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
        // No data for this period
        avgResponseTimes.push(0);
        slaComplianceRates.push(0);
        continue;
      }

      let responseTimeSum = 0;
      let slaCompliantCount = 0;

      for (const lead of leads) {
        if (lead.assignedAt && lead.acceptedAt) {
          const assignedMs = lead.assignedAt.getTime();
          const acceptedMs = lead.acceptedAt.getTime();
          const diffSeconds = Math.floor((acceptedMs - assignedMs) / 1000);
          if (diffSeconds >= 0) {
            responseTimeSum += diffSeconds;
            if (diffSeconds <= SLA_SECONDS) {
              slaCompliantCount++;
            }
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

    // Calculate totals for full period
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
