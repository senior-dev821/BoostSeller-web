

// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET() {
//   try {
//     const section = await prisma.pricingSection.findFirst({
//       include: {
//         plans: {
//           orderBy: { order: 'asc' },
//           include: {
//             features: true,
//           },
//         },
//       },
//     });

//     // Return null if no section found
//     return NextResponse.json(section || null);
//   } catch (error) {
//     console.error('[PRICING_GET]', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }

// export async function PUT(req: Request) {
//   try {
//     const body = await req.json();
//     const { id, title, subtitle, plans } = body;

//     let section;

//     if (id) {
//       // Try to update existing section
//       section = await prisma.pricingSection.update({
//         where: { id },
//         data: {
//           title,
//           subtitle,
//         },
//       });
//     } else {
//       // Create new section if no id provided
//       section = await prisma.pricingSection.create({
//         data: {
//           title,
//           subtitle,
//         },
//       });
//     }

//     // Delete existing plans (and cascade features) if updating
//     if (id) {
//       await prisma.pricingPlan.deleteMany({
//         where: { sectionId: section.id },
//       });
//     }

//     // Create new plans and their features
//     for (const plan of plans) {
//       const createdPlan = await prisma.pricingPlan.create({
//         data: {
//           tag: plan.tag,
//           description: plan.description,
//           price: plan.price,
//           duration: plan.duration,
//           ctaText: plan.ctaText,
//           ctaUrl: plan.ctaUrl,
//           order: plan.order,
//           sectionId: section.id,
//         },
//       });

//       for (const feature of plan.features) {
//         await prisma.planFeature.create({
//           data: {
//             text: feature.text,
//             active: feature.active,
//             planId: createdPlan.id,
//           },
//         });
//       }
//     }

//     return NextResponse.json({ success: true, id: section.id });
//   } catch (error) {
//     console.error('[PRICING_PUT]', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    return NextResponse.json(section || null);
  } catch (error) {
    console.error('[PRICING_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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

    return NextResponse.json({ success: true, id: section.id });
  } catch (error) {
    console.error('[PRICING_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


