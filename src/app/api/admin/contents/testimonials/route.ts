
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const section = await prisma.testimonialsSection.findFirst({
      include: {
        testimonials: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!section) {
      // Optional: create default section if not found
      const defaultSection = await prisma.testimonialsSection.create({
        data: {
          title: 'Testimonials',
          subtitle: '',
          testimonials: {
            create: [],
          },
        },
        include: { testimonials: true },
      });
      return NextResponse.json(defaultSection, { status: 201 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('[GET testimonials]', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials section' }, { status: 500 });
  }
}

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

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    if (!Array.isArray(testimonials)) {
      return NextResponse.json({ error: 'Testimonials must be an array' }, { status: 400 });
    }

    // Check if section exists
    const sectionExists = await prisma.testimonialsSection.findUnique({ where: { id } });
    if (!sectionExists) {
      return NextResponse.json({ error: 'Testimonials section not found' }, { status: 404 });
    }

    // Clean testimonials, trim strings and filter invalid entries (e.g. name missing)
    const cleanedTestimonials = testimonials
      .map(t => ({
        name: t.name?.trim() ?? '',
        company: t.company?.trim() ?? '',
        message: t.message?.trim() ?? '',
        avatarUrl: t.avatarUrl?.trim() ?? '',
        rating: Number.isInteger(t.rating) ? t.rating : 5,
      }))
      .filter(t => t.name.length > 0);

    if (cleanedTestimonials.length === 0) {
      return NextResponse.json({ error: 'At least one valid testimonial is required' }, { status: 400 });
    }

    // Detect duplicate names (case-insensitive)
    const nameSet = new Set<string>();
    const duplicates = cleanedTestimonials.filter(t => {
      const lower = t.name.toLowerCase();
      if (nameSet.has(lower)) return true;
      nameSet.add(lower);
      return false;
    });

    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: `Duplicate testimonial names found: ${duplicates.map(d => d.name).join(', ')}` },
        { status: 400 }
      );
    }

    // Use a transaction to delete old testimonials and create new ones atomically
    await prisma.$transaction([
      prisma.testimonial.deleteMany({ where: { sectionId: id } }),
      prisma.testimonial.createMany({
        data: cleanedTestimonials.map(t => ({
          ...t,
          sectionId: id,
        })),
      }),
      prisma.testimonialsSection.update({
        where: { id },
        data: { title, subtitle },
      }),
    ]);

    // Return updated section with testimonials
    const updatedSection = await prisma.testimonialsSection.findUnique({
      where: { id },
      include: { testimonials: true },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('[PUT testimonials]', error);

    if (error === 'P2003') {
      return NextResponse.json({ error: 'Foreign key constraint violation. Please check sectionId.' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update testimonials section' }, { status: 500 });
  }
}
