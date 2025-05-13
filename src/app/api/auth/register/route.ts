import bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client';
import { generateOtp } from '@/lib/generateOtp';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

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

    // 4. Create role-specific record
    if (role === 'hostess') {
      await prisma.hostess.create({ 
				data: { 
					userId: user.id 
				} 
			});
    } else if (role === 'performer') {
      await prisma.performer.create({ 
				data: { 
					userId: user.id 
				} 
			});
    }

    // 5. Generate OTP
    const otp = generateOtp(); // e.g., "482173"
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 6. Save OTP in DB
    await prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    // 7. Send OTP email
    await sendOtpEmail(email, otp);

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
