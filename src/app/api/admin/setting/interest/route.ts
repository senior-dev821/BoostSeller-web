
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  const interests  = await prisma.interest.findMany({});

   return NextResponse.json(interests);
}
