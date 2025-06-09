import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
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



export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	const interestId = Number(params.id);
	try {

		// Delete the related Group first
		await prisma.group.delete({ where: { interestId : interestId} });
	
		// Then delete the Interest
		await prisma.interest.delete({ where: { id: interestId } });
		return NextResponse.json({ success: true });
  } catch (error) {
    console.error("fetching error:", error);
    return new NextResponse(JSON.stringify({error: true, message: "Failed to delete interests. \n Please try again." }), {
      
    });
  }
}
