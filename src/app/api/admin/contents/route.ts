// /app/api/content/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust path if needed

export async function GET() {
  try {
    const [hero, features, aboutOne, aboutTwo, testimonials, pricing, team, video] =
      await Promise.all([
        prisma.heroSection.findFirst(),
        prisma.featuresSection.findFirst(),
        prisma.aboutSectionOne.findFirst(),
        prisma.aboutSectionTwo.findFirst(),
        prisma.testimonialsSection.findFirst(),
        prisma.pricingSection.findFirst(),
        prisma.teamSection.findFirst(),
        prisma.contactSection.findFirst(),
        prisma.newsletterSection.findFirst(),
        prisma.workingStepsSection.findFirst(),
      ]);

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
