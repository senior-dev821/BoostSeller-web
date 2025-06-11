
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  const unReadNotifications  = await prisma.notification.findMany({
    where : {
      receiveId: 0,
      isRead: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

   return NextResponse.json(unReadNotifications);
}
