
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
    const leads = await prisma.lead.findMany({
        include: {
            interest: true,
            hostess: {
                include: {
                    user: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const expandedLeads = await Promise.all(
        leads.map(async (lead) => {
            const assignedTo = lead.assignedTo ?? undefined;
            const acceptedBy = lead.acceptedBy ?? undefined;
            let assignedName = '';
            let assignedAvatarPath = '';
            let acceptedName = '';
            let acceptedAvatarPath = '';

            const assignedPerformer = await prisma.performer.findUnique({
                where: {
                    id: assignedTo,
                },
                include: {
                    user: true,
                }
            });

            if(assignedTo !== undefined) {
                assignedName = assignedPerformer?.user.name ?? '';
                assignedAvatarPath = assignedPerformer?.user.avatarPath ?? '';
            }

            if(acceptedBy !== undefined) {
                acceptedName = assignedPerformer?.user.name ?? '';
                acceptedAvatarPath = assignedPerformer?.user.avatarPath ?? '';
            }

            return {
                ...lead,
                assignedName,
                assignedAvatarPath,
                acceptedName,
                acceptedAvatarPath,
            };
        })
    );

    return NextResponse.json(expandedLeads);
}
