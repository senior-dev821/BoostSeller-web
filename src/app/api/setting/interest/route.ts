import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const currentUser = await getUserFromToken();

    if (!currentUser) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    let interests;

    if (currentUser.role === 'super') {
      interests = await prisma.interest.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      });
    } else if (currentUser.role === 'admin') {
      interests = await prisma.interest.findMany({
        where: { adminId: currentUser.id },
        orderBy: {
          createdAt: 'asc',
        },
      });
    } else {
      return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 });
    }

    if (interests.length === 0) {
      return NextResponse.json({ error: true, empty: true, message: 'No interests found.' }, { status: 200 });
    }

    return NextResponse.json({ error: false, interests }, { status: 200 });

  } catch (error) {
    console.error('GET /interests error:', error);
    return NextResponse.json({ error: true, message: 'Failed to fetch interests. Please try again.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: true, message: 'Only admin can create interests' }, { status: 403 });
    }

    const { name, description } = await req.json();

		const existing = await prisma.interest.findUnique({
      where: { 
        name: name,
        adminId: currentUser.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: true, message: 'An interest with this name already exists.' },
        { status: 400 }
      );
    }

    const interest = await prisma.interest.create({
      data: {
        name,
        description,
        adminId: currentUser.id,
      },
    });

    await prisma.group.create({
      data: {
        name,
        interestId: interest.id,
      },
    });

    return NextResponse.json({ success: true, interest }, { status: 201 });

  } catch (error) {
    console.error('POST /interests error:', error);
    return NextResponse.json({ error: true, message: 'Failed to add interest. Please try again.' }, { status: 500 });
  }
}
