// app/api/admin/contents/hero/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const allowedOrigin = 'https://boostseller.ai'; // Change this to your actual frontend domain

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  // Handle preflight requests
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  try {
    const hero = await prisma.heroSection.findFirst({
      include: { ctaButtons: true },
    });
    return withCors(NextResponse.json(hero));
  } catch (error) {
    console.error('[GET ]', error);
    return withCors(NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 }));
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    const existingHero = await prisma.heroSection.findFirst();
    if (!existingHero) return withCors(NextResponse.json({ error: 'Hero section not found' }, { status: 404 }));

    // Update main fields
    await prisma.heroSection.update({
      where: { id: existingHero.id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
      },
    });

    for (const btn of data.ctaButtons) {
      if (btn.id) {
        await prisma.heroButton.update({
          where: { id: btn.id },
          data: {
            text: btn.text,
            type: btn.type,
            url: btn.url,
          },
        });
      } else {
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

    return withCors(NextResponse.json(result));
  } catch (error) {
    console.error('[PUT /api/cms/hero]', error);
    return withCors(NextResponse.json({ error: 'Failed to update hero section' }, { status: 500 }));
  }
}
