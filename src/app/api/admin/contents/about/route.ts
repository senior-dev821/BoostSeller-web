import { prisma } from '@/lib/prisma';
import { Benefits } from '@prisma/client';
import { NextResponse } from 'next/server';

const allowedOrigin = 'https://boostseller.ai'; // <-- Change this!

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  // Preflight CORS handler
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  try {
    const sectionOne = await prisma.aboutSectionOne.findFirst();
    const sectionTwo = await prisma.aboutSectionTwo.findFirst({
      include: { benefites: true },
    });

    return withCors(NextResponse.json({ sectionOne, sectionTwo }));
  } catch (error) {
    console.error('[GET_ABOUT]', error);
    return withCors(new NextResponse('Internal Server Error', { status: 500 }));
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { sectionOne, sectionTwo } = body;

    // Handle sectionOne
    if (sectionOne) {
      const existsOne = await prisma.aboutSectionOne.findUnique({
        where: { id: sectionOne.id },
      });

      if (existsOne) {
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
      } else {
        await prisma.aboutSectionOne.create({
          data: {
            id: sectionOne.id,
            title: sectionOne.title,
            subtitle: sectionOne.subtitle,
            contents: sectionOne.contents,
            listItems1: sectionOne.listItems1,
            listItems2: sectionOne.listItems2,
          },
        });
      }
    }

    // Handle sectionTwo
    if (sectionTwo) {
      const existsTwo = await prisma.aboutSectionTwo.findUnique({
        where: { id: sectionTwo.id },
      });

      if (existsTwo) {
        await prisma.aboutSectionTwo.update({
          where: { id: sectionTwo.id },
          data: {
            title: sectionTwo.title,
            subtitle: sectionTwo.subtitle,
          },
        });
      } else {
        await prisma.aboutSectionTwo.create({
          data: {
            id: sectionTwo.id,
            title: sectionTwo.title,
            subtitle: sectionTwo.subtitle,
          },
        });
      }

      if (sectionTwo.benefites) {
        // Delete existing benefits first
        await prisma.benefits.deleteMany({ where: { sectionId: sectionTwo.id } });

        // Re-create benefits
        await prisma.benefits.createMany({
          data: sectionTwo.benefites.map((b: Benefits) => ({
            title: b.title,
            description: b.description,
            sectionId: sectionTwo.id,
          })),
        });
      }
    }

    return withCors(new NextResponse('Updated Successfully'));
  } catch (error) {
    console.error('[PUT_ABOUT]', error);
    return withCors(new NextResponse('Internal Server Error', { status: 500 }));
  }
}
