
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  const groups  = await prisma.group.findMany({});

   return NextResponse.json(groups);
}
