import { prisma } from '@/lib/prisma';
import { LegalSection } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const page = await prisma.legalPage.findUnique({
      where: { slug: 'terms' },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!page) {
      // Option 1: Return empty default structure so frontend handles gracefully
      return NextResponse.json({
        id: 0,
        slug: 'terms',
        title: '',
        welcome: '',
        sections: [],
      });
      // Option 2: Or create the page here if you want automatic creation
      // const newPage = await prisma.legalPage.create({ data: { slug: 'terms', title: '', welcome: '' } });
      // return NextResponse.json({ ...newPage, sections: [] });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('GET /terms error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
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
    // Use map with index to set order properly
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

    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error('PUT /terms error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
