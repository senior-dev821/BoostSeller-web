import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const { startDate, endDate } = body;

        if (!startDate || !endDate) {
            return NextResponse.json({ error: "Missing dates" }, { status: 400 });
        }

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

        const newLeadCount = await prisma.lead.count({
            where: {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
                addedBy: {
                    in: hostessIds,
                },
            },
        });

        const acceptedCurLeadCount = await prisma.lead.count({
            where: {
                acceptedAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
                status: {
                    notIn: [
                        "closed",
                        "completed",
                        "assigned",
                        "pendding"
                    ],
                },
                addedBy: {
                    in: hostessIds,
                },

            },
        });

        const acceptePastLeadCount = await prisma.lead.count({
            where: {
                acceptedAt: {
                    lt: new Date(startDate),
                },
                status: {
                    notIn: [
                        "closed",
                        "completed",
                        "assigned",
                        "pendding"
                    ],
                },
                addedBy: {
                    in: hostessIds,
                },

            },
        });

        const inProgressLeadCount = acceptedCurLeadCount + acceptePastLeadCount;

        const lostLeadCount = await prisma.lead.count({
            where: {
                closedAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
                status: "closed",
                addedBy: {
                    in: hostessIds,
                },
            },
            
        });

        const convertedLeadCount = await prisma.lead.count({
            where: {
                completedAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
                status: "completed",
                addedBy: {
                    in: hostessIds,
                },
            },
        });

        const processedLeadCount = lostLeadCount + convertedLeadCount;

        const totalLeadCount = newLeadCount + acceptePastLeadCount;

        const newToProgressRate = newLeadCount > 0
            ? parseFloat(((acceptedCurLeadCount / newLeadCount) * 100).toFixed(2))
            : 0;

        const progressToProcessedRate = inProgressLeadCount > 0
            ? parseFloat(((processedLeadCount / (inProgressLeadCount + processedLeadCount)) * 100).toFixed(2))
            : 0;

        const processedToConvertedRate = processedLeadCount > 0
            ? parseFloat(((convertedLeadCount / processedLeadCount) * 100).toFixed(2))
            : 0;

        const processedToLostRate = processedLeadCount > 0
            ? parseFloat(((lostLeadCount / processedLeadCount) * 100).toFixed(2))
            : 0;

        // Simulated data fetch (replace with your DB or service call)
        const data = {
            leadAnalysis: [
                newLeadCount,
                inProgressLeadCount,
                processedLeadCount,
                lostLeadCount,
                convertedLeadCount,
            ], // example dummy data
            total: totalLeadCount,
            newToProgressRate: newToProgressRate,
            progressToProcessedRate: progressToProcessedRate,
            processedToConvertedRate: processedToConvertedRate,
            processedToLostRate: processedToLostRate,
        };

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}