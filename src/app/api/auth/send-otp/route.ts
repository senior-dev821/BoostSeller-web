// /api/register/request-otp/route.ts
// import { PrismaClient } from '@prisma/client';
import { generateOtp } from '@/lib/generateOtp';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
	
  try {
    const { email } = await req.json();
		console.log("email = ", email);
		if (!email) {
			return new Response(
				JSON.stringify({ error: true, message: "Email is required." }),
				{ status: 400 }
			);
		}
    const existingUser = await prisma.user.findUnique({ where: {email} });

    if (existingUser) {
      return new Response(JSON.stringify({ error: true, message: 'User already exists.' }), { status: 400 });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
		await prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });


		await sendOtpEmail(email, otp);

    return new Response(JSON.stringify({ error: false, message: 'OTP sent to email' }), { status: 200 });
  } catch (err) {
    console.error('OTP Request Error:', err);
    return new Response(JSON.stringify({ error: true, message: 'Failed to send OTP' }), { status: 500 });
  }
}
