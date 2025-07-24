// File: src/app/api/admin/contents/contact-newsletter/route.ts

import { NextRequest, NextResponse } from 'next/server';
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
    const contact = await prisma.contactSection.findFirst();
    const newsletter = await prisma.newsletterSection.findFirst();

    return withCors(NextResponse.json({ contact, newsletter }));
  } catch (error) {
    console.error('GET /contact-newsletter error:', error);
    return withCors(new NextResponse('Internal Server Error', { status: 500 }));
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { contact, newsletter } = await req.json();

    if (!contact || !newsletter) {
      return withCors(new NextResponse('Missing contact or newsletter data', { status: 400 }));
    }

    let updatedContact;
    if (contact.id) {
      updatedContact = await prisma.contactSection.update({
        where: { id: contact.id },
        data: {
          title: contact.title,
          subtitle: contact.subtitle,
        },
      });
    } else {
      updatedContact = await prisma.contactSection.create({
        data: {
          title: contact.title,
          subtitle: contact.subtitle,
        },
      });
    }

    let updatedNewsletter;
    if (newsletter.id) {
      updatedNewsletter = await prisma.newsletterSection.update({
        where: { id: newsletter.id },
        data: {
          title: newsletter.title,
          subtitle: newsletter.subtitle,
          email: newsletter.email,
          phone: newsletter.phone,
        },
      });
    } else {
      updatedNewsletter = await prisma.newsletterSection.create({
        data: {
          title: newsletter.title,
          subtitle: newsletter.subtitle,
          email: newsletter.email,
          phone: newsletter.phone,
        },
      });
    }

    return withCors(NextResponse.json({ contact: updatedContact, newsletter: updatedNewsletter }));
  } catch (error) {
    console.error('PUT /contact-newsletter error:', error);
    return withCors(new NextResponse('Internal Server Error', { status: 500 }));
  }
}
