
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        isApproved: true,
      }
    });

    
    if (!user) {
      return new Response(JSON.stringify({error: true, message: "user-not-found" }), {});
    }


    const admin = await prisma.admin.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!admin) {
      return new Response(JSON.stringify({error: true, message: "user-not-found" }), {});
    }

    const adminId = admin.id;
    
    return new Response(JSON.stringify({
      error: false,
      adminId: adminId,
    }), {
      status: 200,
    });
  } catch (error) {
    console.error("Fetch data error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to get admin ID. Please try again." }), {});
  }
}
