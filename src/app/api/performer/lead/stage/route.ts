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
    const stageId = formFields['stageId'];

    if (!leadRegisterId || !stageId) {
      return new Response(JSON.stringify({
        error: true,
        message: 'Missing leadId or stageId.',
      }), {
         headers: { 'Content-Type': 'application/json' },
      });
    }

    // const nextStage = await prisma.stage.findFirst({
    //   where: {
    //     id: {
    //       gt: parseInt(stageId),
    //     }
    //   },
    //   orderBy: {
    //     id: 'asc'
    //   }
    // });

    const curStage = await prisma.stage.findUnique({
      where: {
        id: parseInt(stageId),
      },
    });

    
    const nextStage = await prisma.stage.findFirst({
      where: {
        sequence: {
          gt: curStage?.sequence,
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
    const upldatedLead = await prisma.lead.update({
      where: {
        registerId: leadRegisterId,
      },
      data: {
        stageId: nextStageId,
        status: nextStage.name,
      }
    });

    await prisma.lead_stage_mapping.create({
      data: {
        leadId: upldatedLead.id,
        stageId: parseInt(stageId),
        currentValue: formFields,
      },
    });

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
