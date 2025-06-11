import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { startDate, endDate } = body;

        if (!startDate || !endDate) {
            return NextResponse.json({ error: "Missing dates" }, { status: 400 });
        }

        const newLeadCount = await prisma.lead.count({
            where: {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
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
            },
        });

        const convertedLeadCount = await prisma.lead.count({
            where: {
                completedAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
                status: "completed",
            },
        });

        const processedLeadCount = lostLeadCount + convertedLeadCount;

        const totalLeadCount = newLeadCount + acceptePastLeadCount;

        const newToProgressRate = newLeadCount > 0
            ? parseFloat(((acceptedCurLeadCount / newLeadCount) * 100).toFixed(2))
            : 0;

        const progressToProcessedRate = inProgressLeadCount > 0
            ? parseFloat(((processedLeadCount / inProgressLeadCount) * 100).toFixed(2))
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