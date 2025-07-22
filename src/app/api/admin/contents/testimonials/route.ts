// /app/api/admin/contents/testimonials/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET testimonials section and items
export async function GET() {
  try {
    const section = await prisma.testimonialsSection.findFirst({
      include: {
        testimonials: {
          orderBy: { id: 'asc' },
        },
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('[GET testimonials]', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials section' }, { status: 500 });
  }
}

// PUT updated testimonials section and items
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      title,
      subtitle,
      testimonials,
    }: {
      id: number;
      title: string;
      subtitle: string;
      testimonials: {
        id?: number;
        name: string;
        company: string;
        message: string;
        avatarUrl: string;
        rating: number;
      }[];
    } = body;

    // Remove old testimonials
    await prisma.testimonial.deleteMany({
      where: { sectionId: id },
    });

    // Re-create testimonials
    await prisma.testimonial.createMany({
      data: testimonials.map((t) => ({
        name: t.name,
        company: t.company,
        message: t.message,
        avatarUrl: t.avatarUrl,
        rating: t.rating,
        sectionId: id,
      })),
    });

    // Update section
    const updatedSection = await prisma.testimonialsSection.update({
      where: { id },
      data: { title, subtitle },
      include: { testimonials: true },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('[PUT testimonials]', error);
    return NextResponse.json({ error: 'Failed to update testimonials section' }, { status: 500 });
  }
}
