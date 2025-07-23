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

    // Find existing section or create a new one if missing
    let section = await prisma.featuresSection.findFirst({ include: { features: true } });
    if (!section) {
      section = await prisma.featuresSection.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
        },
        include: { features: true },  // Include features here on create
      });
    } else {
      // Update section title and subtitle
      await prisma.featuresSection.update({
        where: { id: section.id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
        },
      });
      // Delete old features linked to this section
      await prisma.feature.deleteMany({ where: { sectionId: section.id } });
    }

    // Prepare features to create, linking to sectionId, and cast order to number
    const featuresToCreate = data.features.map((f: any) => ({
      title: f.title,
      description: f.description,
      order: Number(f.order), // Fix: convert order to number here
      icon: f.icon,
      sectionId: section!.id,
    }));

    // Bulk create features
    await prisma.feature.createMany({ data: featuresToCreate });

    // Return the updated section with ordered features
    const updated = await prisma.featuresSection.findFirst({
      include: { features: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/cms/features]', error);
    return NextResponse.json({ error: 'Failed to update features' }, { status: 500 });
  }
}

