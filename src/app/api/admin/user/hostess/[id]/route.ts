// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();


// export async function DELETE(req: Request, { params }: { params: { id: string } }) {
//   try {
    
//     const resolvedParams = await params;
//     const id = resolvedParams.id;

//     if (!id) {
//       return Response.json({ error: "ID is required" }, { status: 400 });
//     }

//     const hostess = await prisma.hostess.delete({
//       where: { id: Number(id) },
//     });

//     await prisma.user.delete({
//         where: {
//             id: hostess.userId,
//         },
//     });

//     return Response.json({ ok: true, message: "Field deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     return Response.json({ error: "Failed to delete field" }, { status: 500 });
//   }
// }


// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   try {

//     const resolvedParams = await params;
//     const id = resolvedParams.id;
//     if (!id) {
//       return Response.json({ error: "ID is required" }, { status: 400 });
//     }

//     // Parse JSON body from the request
//     const data = await req.json();

//     const { name, phoneNumber, email, isApproved } = data;

//     // Update hostess and user info (adjust if your schema differs)
//     const updatedHostess = await prisma.hostess.update({
//       where: { id: Number(id) },
//       data: {
//         // Assuming hostess has these fields; if not, remove or adjust accordingly
//         // If hostess table doesn't have these fields, you probably want to update user instead
//       },
//     });

//     await prisma.user.update({
//       where: { id: updatedHostess.userId },
//       data: {
//         name,
//         phoneNumber,
//         email,
//         isApproved,
//       },
//     });

//     return Response.json({ ok: true, message: "Hostess updated successfully" });
//   } catch (error) {
//     console.error(error);
//     return Response.json({ error: "Failed to update hostess" }, { status: 500 });
//   }
// }

// File: src/app/api/admin/user/hostess/[id]/route.ts

import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE handler
export async function DELETE(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), {
      status: 400,
    });
  }

  try {
    const hostess = await prisma.hostess.delete({
      where: { id: Number(id) },
    });

    await prisma.user.delete({
      where: {
        id: hostess.userId,
      },
    });

    return new Response(JSON.stringify({ ok: true, message: 'Deleted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Delete failed' }), {
      status: 500,
    });
  }
}

// PUT handler
export async function PUT(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), {
      status: 400,
    });
  }

  try {
    const data = await req.json();
    const { name, phoneNumber, email, isApproved } = data;

    const updatedHostess = await prisma.hostess.update({
      where: { id: Number(id) },
      data: {},
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

    return new Response(JSON.stringify({ ok: true, message: 'Updated successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Update failed' }), {
      status: 500,
    });
  }
}

