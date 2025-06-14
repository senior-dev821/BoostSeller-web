// app/api/admin/stages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const interestId = req.nextUrl.searchParams.get('interestId');

  const stages = await prisma.stage.findMany({
    where: interestId ? { interestId: parseInt(interestId) } : undefined,
    orderBy: { sequence: 'asc' },
  });

  return NextResponse.json(stages);
}

export async function POST(req: NextRequest) {
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
  const body = await req.json();
  const { id, name, description, sequence, interestId, requiredFields } = body;

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
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.stage.delete({
      where: { id: Number(id) },
    });

    return Response.json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete field" }, { status: 500 });
  }
}