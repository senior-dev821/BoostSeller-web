
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  const hostesses  = await prisma.hostess.findMany({
    include: {
        user:true,
        lead:true,
    },
    orderBy: {
        createdAt: 'asc',
    },
  });

   return NextResponse.json(hostesses);
}
