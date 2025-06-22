// pages/api/heatmap.ts
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client';
import { eachDayOfInterval, format, getHours } from "date-fns"
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = new Date(searchParams.get("from") || "")
  const to = new Date(searchParams.get("to") || "")

  const currentUser = await getUserFromToken();
  
  if (!currentUser) {
  return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
  }

  const hostesses = await prisma.hostess.findMany({
      where: {
      adminId: currentUser.id,
      },
      select: {
      id: true,
      },
  });

  const hostessIds = hostesses.map(h => h.id);

  const interests = await prisma.interest.findMany({
    where: {
      adminId: currentUser.id,
    },
    select: {
      id: true,
    },
  });

  const interestIds = interests.map(interest => interest.id);

  // 1. Heatmap Data (Sun–Sat, working hours 8–19)
	const leads = await prisma.lead.findMany({
		where: {
			createdAt: {
				gte: from,
				lte: to,
			},
		},
		select: {
			createdAt: true,
		},
	})

	// Include all days (Sunday to Saturday) — no filter
	const days = eachDayOfInterval({ start: from, end: to })

	const heatmap = days.map((day) => {
		const hours = new Array(24).fill(0) // 24-hour heatmap
		for (const lead of leads) {
			if (format(lead.createdAt, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")) {
				const hour = getHours(lead.createdAt)
				hours[hour]++ // 0 to 23
			}
		}
		return {
			date: day.toISOString(),
			hours,
		}
	})
	


  // 2. Group Status (availability)
  const performers = await prisma.performer.findMany({
    where: {
      adminId: currentUser.id,
    },
  })
  const availablePerformers = performers.filter(
    (p) =>
      p.available &&
      p.acceptedCount - (p.closedCount + p.completedCount) < p.assignedCount
  )
  const allGroups = await prisma.group.findMany({
    where: {
      interestId: {
        in: interestIds,
      }
    },
  })

  const groupStatus = allGroups.map((group) => {
    const hasAvailable = availablePerformers.some((p) =>
      p.groupIds.includes(group.id)
    )
    return {
      name: group.name,
      hasAvailablePerformer: hasAvailable,
    }
  })

  // 3. Risk Leads
  const now = new Date()
  const skipped = await prisma.lead.count({
    where: {
      status: "pendding",
      addedBy: {
          in: hostessIds,
      },
  },
    
  })

  const unresponsive = await prisma.lead.count({
    where: {
      status: {
        notIn: ["closed", "completed"],
      },
      addedBy: {
          in: hostessIds,
      },
      updatedAt: {
        lt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    },
  })

  return NextResponse.json({
    heatmap,
    groupStatus,
    riskCounts: { skipped, unresponsive },
  })
}
