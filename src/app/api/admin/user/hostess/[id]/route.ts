import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const hostess = await prisma.hostess.delete({
      where: { id: Number(id) },
    });

    await prisma.user.delete({
      where: {
        id: hostess.userId,
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
    const id = params.id;

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const data = await req.json();
    const { name, phoneNumber, email, isApproved } = data;

    const updatedHostess = await prisma.hostess.update({
      where: { id: Number(id) },
      data: {
        // Include any fields that actually belong to the hostess model
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
