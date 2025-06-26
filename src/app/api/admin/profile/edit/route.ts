import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, name, email, phone } = await req.json();

    if (!userId || !name || !email) {
      return new Response(JSON.stringify({
        error: true,
        message: 'Required fields are missing.',
      }), { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        name,
        email,
        phoneNumber: phone,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Edit Profile Successful!',
      user: updatedUser, // optional if you want to return it
    }), { status: 200 });

  } catch (err) {
    console.error('[Edit Profile Error]', err);
    return new Response(JSON.stringify({
      error: true,
      message: 'Failed to edit user. Please try again.',
    }), { status: 500 });
  }
}
