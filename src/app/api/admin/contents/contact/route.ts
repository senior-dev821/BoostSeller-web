// File: src/app/api/admin/contents/contact-newsletter/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const contact = await prisma.contactSection.findFirst();
    const newsletter = await prisma.newsletterSection.findFirst();

    return NextResponse.json({ contact, newsletter });
  } catch (error) {
    console.error('GET /contact-newsletter error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { contact, newsletter } = await req.json();

    if (!contact || !newsletter) {
      return new NextResponse('Missing contact or newsletter data', { status: 400 });
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
      // If no id provided, create a new record
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
      // If no id provided, create a new record
      updatedNewsletter = await prisma.newsletterSection.create({
        data: {
          title: newsletter.title,
          subtitle: newsletter.subtitle,
          email: newsletter.email,
          phone: newsletter.phone,
        },
      });
    }

    return NextResponse.json({ contact: updatedContact, newsletter: updatedNewsletter });
  } catch (error) {
    console.error('PUT /contact-newsletter error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
