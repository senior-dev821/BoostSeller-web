
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export async function GET() {
  try {
    const interests = await prisma.interest.findMany();
    if(interests.length == 0) {
        return new NextResponse(JSON.stringify({ error: true, message: "Not found Interests." }), {
          
        });
    }
    return new NextResponse(JSON.stringify({
      error: false,
      interests,
    }), {
      status: 200,
      
    });
   
  } catch (error) {
    console.error("fetching error:", error);
    return new NextResponse(JSON.stringify({error: true, message: "Failed to fetch interests. \n Please try again." }), {
      
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();

    const existing = await prisma.interest.findUnique({
      where: { name: name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An interest with this name already exists.' },
        { status: 400 }
      );
    }

    const interest = await prisma.interest.create({ data: { name, description } });

    await prisma.group.create({
      data: {
        name: name,
        interestId: interest.id,
      },
    });

    // ✅ Return a response after successful creation
    return NextResponse.json(
      { success: true, interest },
      { status: 201 }
    );

  } catch (error) {
    console.error("fetching error:", error);
    return NextResponse.json(
      { error: true, message: "Failed to add interest. Please try again." },
      { status: 500 }
    );
  }
}