import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
) {
  try {
    const page = await prisma.legalPage.findUnique({
      where: { slug: 'terms' },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: 'terms' } }
) {
  const body = await req.json();
  const { title, welcome, sections } = body;
  try {
    const page = await prisma.legalPage.upsert({
      where: { slug: params.slug },
      update: { title, welcome },
      create: { slug: params.slug, title, welcome },
    });

    await prisma.legalSection.deleteMany({ where: { pageId: page.id } });

    await prisma.legalSection.createMany({
      data: sections.map((s: any, index: number) => ({
        title: s.title,
        content: s.content,
        list: s.list,
        order: index,
        pageId: page.id,
      })),
    });

    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
