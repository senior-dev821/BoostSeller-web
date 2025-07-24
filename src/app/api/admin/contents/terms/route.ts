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
      where: { slug: 'terms' },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!page) {
      return withCors(
        NextResponse.json({
          id: 0,
          slug: 'terms',
          title: '',
          welcome: '',
          sections: [],
        })
      );
    }

    return withCors(NextResponse.json(page));
  } catch (error) {
    console.error('GET /terms error:', error);
    return withCors(NextResponse.json({ error: 'Server error' }, { status: 500 }));
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { title, welcome, sections } = body;

    // Upsert the legalPage with slug 'terms'
    const page = await prisma.legalPage.upsert({
      where: { slug: 'terms' },
      update: { title, welcome },
      create: { slug: 'terms', title, welcome },
    });

    // Delete existing sections for this page
    await prisma.legalSection.deleteMany({
      where: { pageId: page.id },
    });

    // Create new sections with order preserved and pageId linked
    if (Array.isArray(sections) && sections.length > 0) {
      await prisma.legalSection.createMany({
        data: sections.map((section: LegalSection, index: number) => ({
          title: section.title,
          content: section.content,
          list: section.list ?? [],
          order: index,
          pageId: page.id,
        })),
      });
    }

    return withCors(NextResponse.json({ message: 'Updated' }));
  } catch (error) {
    console.error('PUT /terms error:', error);
    return withCors(NextResponse.json({ error: 'Server error' }, { status: 500 }));
  }
}
