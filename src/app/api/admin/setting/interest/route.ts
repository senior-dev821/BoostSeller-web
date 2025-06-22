import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const currentUser = await getUserFromToken();

    if (!currentUser) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
    }

    let interests;

    if (currentUser.role === 'super') {
      // Super admin: return all interests
      interests = await prisma.interest.findMany({});
    } else if (currentUser.role === 'admin') {
      // Admin: return interests belonging to this admin
      interests = await prisma.interest.findMany({
        where: {
          adminId: currentUser.id,
        },
      });
    } else {
      return NextResponse.json({ error: true, message: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(interests);
  } catch (error) {
    console.error("Error fetching interests:", error);
    return NextResponse.json({ error: true, message: "Internal server error" }, { status: 500 });
  }
}
