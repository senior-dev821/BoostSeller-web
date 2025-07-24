// app/api/cms/features/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Feature } from '@prisma/client';

const allowedOrigin = 'https://your-frontend-domain.com'; // <-- Change this!

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  // Handle CORS preflight requests
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  try {
    const section = await prisma.featuresSection.findFirst({
      include: { features: { orderBy: { order: 'asc' } } },
    });
    return withCors(NextResponse.json(section));
  } catch (error) {
    console.error('[GET /api/cms/features]', error);
    return withCors(
      NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 })
    );
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
        include: { features: true },
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
    const featuresToCreate = data.features.map((f: Feature) => ({
      title: f.title,
      description: f.description,
      order: Number(f.order),
      icon: f.icon,
      sectionId: section!.id,
    }));

    // Bulk create features
    await prisma.feature.createMany({ data: featuresToCreate });

    // Return the updated section with ordered features
    const updated = await prisma.featuresSection.findFirst({
      include: { features: { orderBy: { order: 'asc' } } },
    });

    return withCors(NextResponse.json(updated));
  } catch (error) {
    console.error('[PUT /api/cms/features]', error);
    return withCors(
      NextResponse.json({ error: 'Failed to update features' }, { status: 500 })
    );
  }
}
