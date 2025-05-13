import { PrismaClient } from '@prisma/client';
import { generateOtp } from '@/lib/generateOtp';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: true, message: 'Email is required.' }), {
        status: 400,
      });
    }

    const otp = generateOtp(); // e.g., "394812"
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins from now

    // Save to OTP table
    await prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    // Send email
    await sendOtpEmail(email, otp);

    return new Response(
      JSON.stringify({
        error: false,
        message: 'OTP sent successfully! Please check your email.',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending OTP:', error);
    return new Response(
      JSON.stringify({
        error: true,
        message: 'Failed to send OTP. Please try again.',
      }),
      { status: 500 }
    );
  }
}
