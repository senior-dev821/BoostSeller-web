

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        user: true,
      },
			orderBy: {
        createdAt: 'asc',
   		},
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
