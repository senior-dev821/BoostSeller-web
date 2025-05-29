import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const updates = body.map((stage: { id: number; sequence: number }) => {
      if (typeof stage.id !== 'number' || typeof stage.sequence !== 'number') {
        throw new Error('Each item must have numeric id and sequence');
      }

      return prisma.stage.update({
        where: { id: stage.id },
        data: { sequence: stage.sequence },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, message: 'Stages reordered successfully' });
  } catch (error) {
    console.error('Error reordering stages:', error);
    return NextResponse.json(
      { error: 'Failed to reorder stages', details: error },
      { status: 500 }
    );
  }
}
