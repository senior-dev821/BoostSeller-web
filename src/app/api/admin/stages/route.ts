import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const currentUser = await getUserFromToken();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const interestId = req.nextUrl.searchParams.get('interestId');
  let whereCondition = {};

  if (currentUser.role === 'super') {
    if (interestId) {
      whereCondition = { interestId: parseInt(interestId) };
    }
  } else if (currentUser.role === 'admin') {
    const adminInterests = await prisma.interest.findMany({
      where: { adminId: currentUser.id },
      select: { id: true },
    });
    const adminInterestIds = adminInterests.map((i) => i.id);

    whereCondition = {
      interestId: {
        in: adminInterestIds,
        ...(interestId ? [parseInt(interestId)].includes(parseInt(interestId)) && { equals: parseInt(interestId) } : {}),
      },
    };
  } else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const stages = await prisma.stage.findMany({
    where: whereCondition,
    orderBy: { sequence: 'asc' },
  });

  return NextResponse.json(stages);
}

export async function POST(req: NextRequest) {
  const currentUser = await getUserFromToken();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  if (Array.isArray(body)) {
    for (const item of body) {
      await prisma.stage.update({
        where: { id: item.id },
        data: { sequence: item.sequence },
      });
    }
    return NextResponse.json({ message: 'Reordered' });
  }

  const { name, description, sequence, interestId, requiredFields } = body;

  // Admins can only create stages for their own interests
  if (currentUser.role === 'admin') {
    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
    });

    if (!interest || interest.adminId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const newStage = await prisma.stage.create({
    data: {
      name,
      description,
      sequence,
      interestId,
      requiredFields,
    },
  });

  return NextResponse.json(newStage);
}

export async function PUT(req: NextRequest) {
  const currentUser = await getUserFromToken();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, description, sequence, interestId, requiredFields } = body;

  if (currentUser.role === 'admin') {
    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
    });

    if (!interest || interest.adminId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const updatedStage = await prisma.stage.update({
    where: { id },
    data: {
      name,
      description,
      sequence,
      interestId,
      requiredFields,
    },
  });

  return NextResponse.json(updatedStage);
}

export async function DELETE(req: Request) {
  const currentUser = await getUserFromToken();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const stage = await prisma.stage.findUnique({
      where: { id: Number(id) },
    });

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }
		const interest = await prisma.interest.findUnique({
      where: { id: Number(stage.interestId) },
    });

    if (currentUser.role === 'admin' && interest?.adminId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.stage.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Field deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete field' }, { status: 500 });
  }
}
