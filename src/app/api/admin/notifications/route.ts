
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  const notifications  = await prisma.notification.findMany({
    where : {
      receiveId: 0,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

   return NextResponse.json(notifications);
}
