// app/api/admin/contents/hero/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const hero = await prisma.heroSection.findFirst({
      include: { ctaButtons: true },
    });
    return NextResponse.json(hero);
  } catch (error) {
    console.error('[GET /api/cms/hero]', error);
    return NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    const existingHero = await prisma.heroSection.findFirst();
    if (!existingHero) return NextResponse.json({ error: 'Hero section not found' }, { status: 404 });

    // Update main fields
    const updatedHero = await prisma.heroSection.update({
      where: { id: existingHero.id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
      },
    });

    for (const btn of data.ctaButtons) {
  if (btn.id) {
    // Update existing button
    await prisma.heroButton.update({
      where: { id: btn.id },
      data: {
        text: btn.text,
        type: btn.type,
        url: btn.url,
      },
    });
  } else {
    // Create new button since no ID
    await prisma.heroButton.create({
      data: {
        text: btn.text,
        type: btn.type,
        url: btn.url,
        heroId: existingHero.id,
      },
    });
  }
}

    const result = await prisma.heroSection.findFirst({
      include: { ctaButtons: true },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/cms/hero]', error);
    return NextResponse.json({ error: 'Failed to update hero section' }, { status: 500 });
  }
}
