import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const currentUser = await getUserFromToken();

    if (!currentUser) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
    }

    let leads;

    if (currentUser.role === 'super') {
      // Super admin gets all leads
      leads = await prisma.lead.findMany({
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
    } else if (currentUser.role === 'admin') {
      // Get hostess IDs belonging to this admin
      const hostesses = await prisma.hostess.findMany({
        where: {
          adminId: currentUser.id,
        },
        select: {
          id: true,
        },
      });

      const hostessIds = hostesses.map(h => h.id);

      // Get only leads added by this admin's hostesses
      leads = await prisma.lead.findMany({
        where: {
          addedBy: {
            in: hostessIds,
          },
        },
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
    } else {
      return NextResponse.json({ error: true, message: "Access denied" }, { status: 403 });
    }

    // Enrich each lead with assigned and accepted performer info + stages
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
          },
        });

        const enrichedStages = await Promise.all(
          stages.map(async (stage) => {
            const stageHistory = await prisma.lead_stage_history.findFirst({
              where: {
                stageId: stage.id,
                leadId: lead.id,
              },
            });
            return {
              ...stage,
              curValues: stageHistory?.currentValue,
            };
          })
        );

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
          stages: enrichedStages,
        };
      })
    );

    return NextResponse.json(expandedLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: true, message: "Internal server error" }, { status: 500 });
  }
}
