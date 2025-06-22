
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { adminId } = await req.json();
    const interests = await prisma.interest.findMany({
        where: {
            adminId: parseInt(adminId),
        },
        orderBy: {
          createdAt: 'asc',
        },
    });

    
    return new Response(JSON.stringify({
      error: false,
      interests: interests,
    }), {
      status: 200,
    });
  } catch (error) {
    console.error("Fetch data error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to get interests. Please try again." }), {});
  }
}
