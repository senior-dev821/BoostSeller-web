import bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {

  try {
    const { name, email, phoneNumber, password, role } = await req.json();

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: true, message: 'User already exists.' }),
        { status: 400 }
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        role,
        isVerified: false,
        isApproved: false,
      },
    });

    if (role === 'admin') {
      await prisma.admin.create({ 
				data: { 
					userId: user.id 
				} 
			});
    }
		    
    return new Response(
      JSON.stringify({
        error: false,
        message: 'Registration successful! OTP sent to email.',
        userId: user.id,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return new Response(
      JSON.stringify({ error: true, message: 'Failed to register. Please try again.' }),
      { status: 500 }
    );
  }
}
