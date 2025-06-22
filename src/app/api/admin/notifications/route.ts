
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const currentUser = await getUserFromToken();
  if (!currentUser) {
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
  }

  const notifications  = await prisma.notification.findMany({
    where : {
      receiveId: currentUser.userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

   return NextResponse.json(notifications);
}
