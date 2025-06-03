import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const performer = await prisma.performer.delete({
      where: { id: Number(id) },
    });

    await prisma.user.delete({
      where: {
        id: performer.userId,
      },
    });

    return Response.json({ ok: true, message: "Field deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete field" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {

    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    // Parse JSON body from the request
    const data = await req.json();

    const { name, phoneNumber, email, isApproved, isAvailable, groupId } = data;

    // Update hostess and user info (adjust if your schema differs)
    const updatedHostess = await prisma.performer.update({
      where: { id: Number(id) },
      data: {
        available: isAvailable,
        groupId:groupId,
      },
    });

    await prisma.user.update({
      where: { id: updatedHostess.userId },
      data: {
        name,
        phoneNumber,
        email,
        isApproved,
      },
    });

    return Response.json({ ok: true, message: "Hostess updated successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update hostess" }, { status: 500 });
  }
}

