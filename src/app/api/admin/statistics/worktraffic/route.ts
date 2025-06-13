// pages/api/heatmap.ts
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client';
import { eachDayOfInterval, format, getHours } from "date-fns"

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = new Date(searchParams.get("from") || "")
  const to = new Date(searchParams.get("to") || "")

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
		const hours = new Array(12).fill(0)
		for (const lead of leads) {
			if (format(lead.createdAt, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")) {
				const hour = getHours(lead.createdAt)
				if (hour >= 8 && hour <= 19) {
					hours[hour - 8]++
				}
			}
		}
		return {
			date: day.toISOString(),
			hours,
		}
	})


  // 2. Group Status (availability)
  const performers = await prisma.performer.findMany()
  const availablePerformers = performers.filter(
    (p) =>
      p.available &&
      p.acceptedCount - (p.closedCount + p.completedCount) < p.assignedCount
  )
  const allGroups = await prisma.group.findMany()

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
      status: "pending",
    },
  })

  const unresponsive = await prisma.lead.count({
    where: {
      status: {
        notIn: ["closed", "completed"],
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
