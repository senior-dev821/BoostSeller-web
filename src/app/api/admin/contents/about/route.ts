import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sectionOne = await prisma.aboutSectionOne.findFirst();
    const sectionTwo = await prisma.aboutSectionTwo.findFirst({
      include: { benefites: true },
    });

    return NextResponse.json({ sectionOne, sectionTwo });
  } catch (error) {
    console.error('[GET_ABOUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { sectionOne, sectionTwo } = body;

    if (sectionOne) {
      await prisma.aboutSectionOne.update({
        where: { id: sectionOne.id },
        data: {
          title: sectionOne.title,
          subtitle: sectionOne.subtitle,
          contents: sectionOne.contents,
          listItems1: sectionOne.listItems1,
          listItems2: sectionOne.listItems2,
        },
      });
    }

    if (sectionTwo) {
      await prisma.aboutSectionTwo.update({
        where: { id: sectionTwo.id },
        data: {
          title: sectionTwo.title,
          subtitle: sectionTwo.subtitle,
        },
      });

      if (sectionTwo.benefites) {
        // First delete existing benefits
        await prisma.benefits.deleteMany({ where: { sectionId: sectionTwo.id } });

        // Then re-create
        await prisma.benefits.createMany({
          data: sectionTwo.benefites.map((b: any) => ({
            title: b.title,
            description: b.description,
            sectionId: sectionTwo.id,
          })),
        });
      }
    }

    return new NextResponse('Updated Successfully');
  } catch (error) {
    console.error('[PUT_ABOUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
