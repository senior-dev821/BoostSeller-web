// /app/api/content/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust path if needed

export async function GET() {
  try {
    const hero = await prisma.heroSection.findFirst({
          include: { ctaButtons: true },
        });
    const features = await prisma.featuresSection.findFirst({
      include: { features: { orderBy: { order: 'asc' } } },
    });
    const aboutOne = await prisma.aboutSectionOne.findFirst();
    const aboutTwo = await prisma.aboutSectionTwo.findFirst({
      include: { benefites: true },
		});
		const team = await prisma.teamSection.findFirst({
      include: { members: true },
    });

		const pricing = await prisma.pricingSection.findFirst({
      include: {
        plans: {
          orderBy: { order: 'asc' },
          include: {
            features: true,
          },
        },
      },
    });

		const testimonials = await prisma.testimonialsSection.findFirst({
      include: {
        testimonials: {
          orderBy: { id: 'asc' },
        },
      },
    });

		const video = await prisma.workingStepsSection.findFirst({
			include: {
				steps: {
					orderBy: { order: 'asc' },
				},
			},
		});
	
    return NextResponse.json({
      hero,
      features,
      aboutOne,
      aboutTwo,
      testimonials,
      pricing,
      team,
      video,
    });
  } catch (error) {
    console.error('[API /content] Error:', error);
    return NextResponse.json({ error: 'Failed to load content.' }, { status: 500 });
  }
}
