
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const currentUser = await getUserFromToken();
  
  if (!currentUser) {
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
  }

  const interests = await prisma.interest.findMany({
    where: {
      adminId: currentUser.id,
    },
    select: {
      id: true,
    },
  });

const interestIds = interests.map(interest => interest.id);

  const groups  = await prisma.group.findMany({
    where: {
      interestId: {
        in: interestIds,
      }
    }
  });

   return NextResponse.json(groups);
}
