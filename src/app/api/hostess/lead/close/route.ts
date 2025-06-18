
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { registerId } = await req.json();

    const lead = await prisma.lead.update({
      where: {
        registerId: registerId,
      },
     data: {
      status: 'closed',
      assignedTo: null,
      triedPerformerIds: [],
      closedAt: new Date(),
     },
      
    });

    const curValues = {
      reason: "all skipped",
    }

    await prisma.lead_stage_history.create({
      data: {
        leadId: lead.id,
        stageId: 0,
        currentValue: curValues,
      },
    });

    return new Response(JSON.stringify({
      error: false,
    }), {
      status: 200,
    });
  } catch (error) {
    console.error("Fetch data error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to close new lead. Please try again." }), {});
  }
}
