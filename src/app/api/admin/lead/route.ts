import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
        const stages = await prisma.stage.findMany({
          where: {
            interestId: lead.interestId,
          },
          orderBy: {
            sequence: 'asc',
          }
        });

        const assignedPerformer = assignedTo
          ? await prisma.performer.findUnique({
              where: { id: assignedTo },
              include: { user: true },
            })
          : null;

        const acceptedPerformer = acceptedBy
          ? await prisma.performer.findUnique({
              where: { id: acceptedBy },
              include: { user: true },
            })
          : null;

        if (assignedPerformer?.user) {
          assignedName = assignedPerformer.user.name;
          assignedAvatarPath = assignedPerformer.user.avatarPath ?? '';
        }

        if (acceptedPerformer?.user) {
          acceptedName = acceptedPerformer.user.name;
          acceptedAvatarPath = acceptedPerformer.user.avatarPath ?? '';
        }

        return {
          ...lead,
          assignedName,
          assignedAvatarPath,
          acceptedName,
          acceptedAvatarPath,
          stages,
        };
      })
    );

    return NextResponse.json(expandedLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: true, message: "Internal server error" }, { status: 500 });
  }
}
