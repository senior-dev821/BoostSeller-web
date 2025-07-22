import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma';

// GET: Fetch Pricing Section with nested plans and features
export async function GET() {
  try {
    const section = await prisma.pricingSection.findFirst({
      include: {
        plans: {
          orderBy: { order: 'asc' },
          include: {
            features: true,
          },
        },
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('[PRICING_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT: Update Pricing Section with nested plans/features
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subtitle, plans } = body;

    // Update section
    await prisma.pricingSection.update({
      where: { id },
      data: {
        title,
        subtitle,
      },
    });

    // Delete existing plans (cascades features)
    await prisma.pricingPlan.deleteMany({
      where: { sectionId: id },
    });

    // Recreate updated plans and features
    for (const plan of plans) {
      const createdPlan = await prisma.pricingPlan.create({
        data: {
          tag: plan.tag,
          description: plan.description,
          price: plan.price,
          duration: plan.duration,
          ctaText: plan.ctaText,
          ctaUrl: plan.ctaUrl,
          order: plan.order,
          sectionId: id,
        },
      });

      for (const feature of plan.features) {
        await prisma.planFeature.create({
          data: {
            text: feature.text,
            active: feature.active,
            planId: createdPlan.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PRICING_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
