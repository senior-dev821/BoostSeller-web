import { prisma } from '@/lib/prisma';
import { LegalSection } from '@prisma/client';
import { NextResponse } from 'next/server';

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
    const page = await prisma.legalPage.findUnique({
      where: { slug: 'policy' },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!page) {
      return withCors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
    }

    return withCors(NextResponse.json(page));
  } catch (error) {
    console.error('GET error:', error);
    return withCors(NextResponse.json({ error: 'Server error' }, { status: 500 }));
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { title, welcome, sections } = body;

    const page = await prisma.legalPage.upsert({
      where: { slug: 'policy' },
      update: { title, welcome },
      create: { slug: 'policy', title, welcome },
    });

    // Clear old sections
    await prisma.legalSection.deleteMany({ where: { pageId: page.id } });

    // Create new sections
    await prisma.legalSection.createMany({
      data: (sections || []).map((s: LegalSection, index: number) => ({
        title: s.title ?? '',
        content: s.content ?? '',
        list: s.list ?? [],
        order: index,
        pageId: page.id,
      })),
    });

    return withCors(NextResponse.json({ message: 'Updated' }));
  } catch (error) {
    console.error('PUT error:', error);
    return withCors(NextResponse.json({ error: 'Server error' }, { status: 500 }));
  }
}
