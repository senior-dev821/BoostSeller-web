// app/api/cms/features/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const section = await prisma.featuresSection.findFirst({
      include: { features: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json(section);
  } catch (error) {
    console.error('[GET /api/cms/features]', error);
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    const section = await prisma.featuresSection.findFirst({ include: { features: true } });
    if (!section) {
      return NextResponse.json({ error: 'Features section not found' }, { status: 404 });
    }

    // Update section title & subtitle
    await prisma.featuresSection.update({
      where: { id: section.id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
      },
    });

    // Remove existing features
    await prisma.feature.deleteMany({ where: { sectionId: section.id } });

    // Re-insert updated features
    for (const f of data.features) {
      await prisma.feature.create({
        data: {
          title: f.title,
          description: f.description,
          order: f.order,
          section: { connect: { id: section.id } },
        },
      });
    }

    const updated = await prisma.featuresSection.findFirst({
      include: { features: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/cms/features]', error);
    return NextResponse.json({ error: 'Failed to update features' }, { status: 500 });
  }
}
