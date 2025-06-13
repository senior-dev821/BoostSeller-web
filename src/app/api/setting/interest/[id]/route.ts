import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    // Get the ID from the request URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Gets the [id] from /api/setting/interest/[id]

    if (!id) {
      return NextResponse.json({ error: true, message: 'Missing ID in URL' }, { status: 400 });
    }

    const { name, description } = await req.json();

    const interest = await prisma.interest.update({
      where: { id: Number(id) },
      data: { name, description },
    });

    await prisma.group.update({
      where: { interestId: interest.id },
      data: { name },
    });

    return NextResponse.json({ success: true, interest });
  } catch (error) {
    console.error("fetching error:", error);
    return NextResponse.json(
      { error: true, message: "Failed to update interest. Please try again." },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: true, message: 'Missing ID in URL' }, { status: 400 });
    }

    const interestId = Number(id);
    
    await prisma.interest.delete({
      where: {
        id: interestId
      }
    });

    await prisma.group.delete({
      where: {
        interestId: interestId,
      },
    });
    

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("fetching error:", error);
    return NextResponse.json(
      { error: true, message: "Failed to delete interest. Please try again." },
      { status: 500 }
    );
  }
}


