import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type LeadInputField = {
  id?: number;
  label: string;
  type: string;
  sequence: number;
  items?: string[];
  required: boolean;
  adminId: number;
};

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    if (!Array.isArray(body)) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const fields = body as LeadInputField[];

    const operations = fields.map(async (field) => {
      const { id, label, type, sequence, items = [], required, adminId, } = field;

      if (id) {
        // Updating an existing field
        const existing = await prisma.leadInputSetting.findUnique({
          where: { id: Number(id) },
        });

        if (existing) {
          // If the label is changing, make sure new label doesn't already exist
          if (existing.label !== label) {
            const duplicate = await prisma.leadInputSetting.findUnique({
              where: { label },
            });

            if (duplicate) {
              console.warn(`Duplicate label "${label}" found. Skipping update for id ${id}.`);
              return null;
            }
          }

          return await prisma.leadInputSetting.update({
            where: { id: Number(id) },
            data: { label, type, sequence, required, items },
          });
        } else {
          console.warn(`Field with id ${id} not found. Skipping update.`);
          return null;
        }
      } else {
        // Creating a new field
        const duplicate = await prisma.leadInputSetting.findUnique({
          where: { label },
        });

        if (duplicate) {
          console.warn(`Label "${label}" already exists. Skipping create.`);
          return null;
        }

        return await prisma.leadInputSetting.create({
          data: { label, type, sequence, required, items, adminId },
        });
      }
    });

    const results = await Promise.all(operations);

    return Response.json({
      error: false,
      message: "Fields saved",
      updated: results.filter(Boolean),
    });
  } catch (err) {
    console.error("fetching error:", err);
    return new Response(
      JSON.stringify({
        error: true,
        message: "Failed to create/update field settings. Please try again.",
      }),
      { status: 500 }
    );
  }
}




export async function GET() {
  try {
    const fields = await prisma.leadInputSetting.findMany({
        orderBy: {
            sequence: 'asc'
        },
    });
    if(fields.length == 0) {
        return new Response(JSON.stringify({ error: true, empty: true, message: "Not found LeadAdditional Fields." }), {
          
        });
    }
    return new Response(JSON.stringify({
      error: false,
      fields,
    }), {
      status: 200,
      
    });
   
  } catch (error) {
    console.error("fetching error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to fetch data. \n Please try again." }), {
      
    });
  }
}


// DELETE /api/admin/lead-inputs?id=1 - Delete field by ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.leadInputSetting.delete({
      where: { id: Number(id) },
    });

    return Response.json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete field" }, { status: 500 });
  }
}