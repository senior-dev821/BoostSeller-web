
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const parsedUserId = parseInt(userId);
    const user = await prisma.user.findFirst({
        where: {
            id: parsedUserId,
        },
        include: {
            admin : true,
        },
    });
    
    console.log(user);

    return new Response(JSON.stringify({
      error: false,
      profile: {
        name: user?.name,
        role: user?.role,
        email: user?.email,
        phone: user?.phoneNumber,
        avatarPath: user?.avatarPath,
        endDate: user?.admin?.endDate,
        registerDate: user?.createdAt,
      },
  
    }), {
      status: 200,
    });
  } catch (error) {
    console.error("Fetch data error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to get data. Please try again." }), {});
  }
}
