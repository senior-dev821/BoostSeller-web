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

    const updatedContact = await prisma.contactSection.update({
      where: { id: contact.id },
      data: {
        title: contact.title,
        subtitle: contact.subtitle,
      },
    });

    const updatedNewsletter = await prisma.newsletterSection.update({
      where: { id: newsletter.id },
      data: {
        title: newsletter.title,
        subtitle: newsletter.subtitle,
        email: newsletter.email,
        phone: newsletter.phone,
      },
    });

    return NextResponse.json({ contact: updatedContact, newsletter: updatedNewsletter });
  } catch (error) {
    console.error('PUT /contact-newsletter error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
