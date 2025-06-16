
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const formFields: Record<string, string> = {};
    const uploadedFiles: Record<string, string> = {};
    const uploadDir = join(process.cwd(), 'uploads', 'stage');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    for (const entry of formData.entries()) {
      const [key, value] = entry;

      if (typeof value === 'object' && typeof value.arrayBuffer === 'function') {
        const buffer = Buffer.from(await value.arrayBuffer());
        const filename = `${Date.now()}-${value.name}`;
        const filepath = join(uploadDir, filename);
        const stream = createWriteStream(filepath);
        stream.write(buffer);
        stream.end();
        const publicUrl = `/uploads/stage/${filename}`;
        uploadedFiles[key] = publicUrl;
      } else {
        formFields[key] = value.toString();
      }
    }

    for (const key in uploadedFiles) {
      if (formFields.hasOwnProperty(key)) {
        formFields[key] = uploadedFiles[key]; // overwrite with uploaded path
      }
    }

    const leadRegisterId = formFields['leadRegisterId'];
    const acceptedLead = await prisma.lead.findUnique({
      where : {
        registerId: leadRegisterId,
      },
    });
    const interestId = acceptedLead?.interestId;
    const stageId = formFields['stageId'];

    if (!leadRegisterId || !stageId) {
      return new Response(JSON.stringify({
        error: true,
        message: 'Missing leadId or stageId.',
      }), {
         headers: { 'Content-Type': 'application/json' },
      });
    }
    if (acceptedLead === null) return;
    await prisma.lead_stage_history.create({
      data: {
        leadId: acceptedLead.id,
        stageId: parseInt(stageId),
        currentValue: formFields,
      },
    });
    const curStage = await prisma.stage.findUnique({
      where: {
        id: parseInt(stageId),
      },
    });
    const curStageSequence = curStage?.sequence;
    const nextStage = await prisma.stage.findFirst({
      where: {
        interestId: interestId,
        sequence: {
          gt: curStageSequence,
        }
      },
      orderBy: {
        sequence: 'asc'
      }
    });

    if (!nextStage) {
        return new Response(JSON.stringify({
        error: false,
        final : true,
      }), {
        status: 200,
      });
    } 
		
    const nextStageId = nextStage.id;
		if(acceptedLead) {
			await prisma.lead.update({
				where: {
					registerId: leadRegisterId,
				},
				data: {
					stageId: nextStageId,
					status: nextStage.name,
				},
			});
		}

		else {
			return new Response(JSON.stringify({
        error: true,
        message: 'Lead not found.',
      }), {
         headers: { 'Content-Type': 'application/json' },
      });
		}
    


    return new Response(JSON.stringify({
      error: false,
      nextStageId: nextStageId,
      nextStatus: nextStage.name,
      final : false,
    }), {
      status: 200,
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      error: true,
      message: 'Unalbe to communicate with the server. Try again.',
    }), {
    });
  }
}

export async function GET() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: {
        sequence: 'asc',
      }
    });
    if(stages.length == 0) {
        return new Response(JSON.stringify({ error: true, message: "Not found Sales Stages." }), {
          
        });
    }
    return new Response(JSON.stringify({
      error: false,
      stages,
    }), {
      status: 200,
      
    });
   
  } catch (error) {
    console.error("fetching error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to fetch stages. Please try again." }), {
      
    });
  }
}
