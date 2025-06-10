
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const paresedUserId = parseInt(userId);
    
    const curUser = await prisma.user.findFirst({
        where: {
            id: paresedUserId,
        }
    });
    
    if(!curUser) {
      return new Response(JSON.stringify({error: true, message: "User not found." }), {});
    }

    const isApproved = curUser.isApproved;
    
    return new Response(JSON.stringify({
      error: false,
      isApproved: isApproved
    }), {
      status: 200,
    });
  } catch (error) {
    console.error("Fetch data error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to save disturb setting. Please try again." }), {});
  }
}
