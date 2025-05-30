// app/api/admin/stages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust import as needed

export async function GET() {
  const stages = await prisma.stage.findMany({
    orderBy: { sequence: 'asc' },
  });
  return NextResponse.json(stages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle reordering or new stage creation
  if (Array.isArray(body)) {
    for (const item of body) {
      await prisma.stage.update({
        where: { id: item.id },
        data: { sequence: item.sequence },
      });
    }
    return NextResponse.json({ message: 'Reordered' });
  }

  const { name, description, sequence, requiredFields } = body;

  const newStage = await prisma.stage.create({
    data: {
      name,
      description,
      sequence,
      requiredFields,
    },
  });

  return NextResponse.json(newStage);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, name, description, sequence, requiredFields } = body;

  const updatedStage = await prisma.stage.update({
    where: { id },
    data: {
      name,
      description,
      sequence,
      requiredFields,
    },
  });

  return NextResponse.json(updatedStage);
}
