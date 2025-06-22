
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    
    const { adminId } = await req.json();
    const fields = await prisma.leadInputSetting.findMany({
        where: {
            adminId: parseInt(adminId),
        },
        orderBy: {
          sequence: 'asc',
        }
    });

    return new Response(JSON.stringify({
      error: false,
      fields: fields,
    }), {
      status: 200,
    });
  } catch (error) {
    console.error("Fetch data error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to get interests. Please try again." }), {});
  }
}
