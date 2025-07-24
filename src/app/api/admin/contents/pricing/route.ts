import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const allowedOrigin = 'https://boostseller.ai'; // <-- Change this!

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

    // Return null if no section found
    return withCors(NextResponse.json(section || null));
  } catch (error) {
    console.error('[PRICING_GET]', error);
    return withCors(new NextResponse('Internal Server Error', { status: 500 }));
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subtitle, plans } = body;

    let section;

    if (id) {
      section = await prisma.pricingSection.update({
        where: { id },
        data: { title, subtitle },
      });
    } else {
      section = await prisma.pricingSection.findFirst();

      if (section) {
        section = await prisma.pricingSection.update({
          where: { id: section.id },
          data: { title, subtitle },
        });
      } else {
        section = await prisma.pricingSection.create({
          data: { title, subtitle },
        });
      }
    }

    // First, find all plans for the section
    const existingPlans = await prisma.pricingPlan.findMany({
      where: { sectionId: section.id },
      select: { id: true },
    });

    // Delete all features for those plans
    const planIds = existingPlans.map(plan => plan.id);
    if (planIds.length > 0) {
      await prisma.planFeature.deleteMany({
        where: { planId: { in: planIds } },
      });
    }

    // Now delete the plans
    await prisma.pricingPlan.deleteMany({
      where: { sectionId: section.id },
    });

    // Create new plans and features
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
          sectionId: section.id,
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

    return withCors(NextResponse.json({ success: true, id: section.id }));
  } catch (error) {
    console.error('[PRICING_PUT]', error);
    return withCors(new NextResponse('Internal Server Error', { status: 500 }));
  }
}
