import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(
        JSON.stringify({ error: true, message: "User not found" }),
        { status: 404 }
      );
    }

		const adminRecord = await prisma.admin.findUnique({
			where: { userId: user.id },
		});

    if (user.role === "admin" || user.role === "super") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return new Response(
          JSON.stringify({
            error: true,
            message: "Password is Invalid. \n Please enter correct password.",
          }),
          { status: 401 }
        );
      }

      if (!user.isApproved) {
        // Check admin record and end date
       

        if (adminRecord) {
          const now = new Date();
          const endDate = new Date(adminRecord.endDate);

          if (endDate < now) {
            return new Response(
              JSON.stringify({
                error: true,
                message:
                  "Your approval period has expired. \n Please contact Super Admin to renew access.",
              }),
              { status: 403 }
            );
          }
        }

        return new Response(
          JSON.stringify({
            error: true,
            message:
              "You are not Approved by Super Admin. \n Please wait until approval.",
          }),
          { status: 403 }
        );
      }

      const token = jwt.sign(
        { id: adminRecord?.id, email: user.email, role: user.role, userId: user.id, },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      const responseHeaders = new Headers({
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${
          process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict;' : ''
        }`,
        'Content-Type': 'application/json',
      });

      return new Response(
        JSON.stringify({
          error: false,
          message: "Logged in successfully!",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone_number: user.phoneNumber,
            is_verified: user.isVerified,
            is_approved: user.isApproved,
          },
        }),
        {
          status: 200,
          headers: responseHeaders,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: true,
          message:
            "Your role is Invalid. \n Please enter correct account for Admin or Super Admin.",
        }),
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        error: true,
        message: "Failed to login \n Please try again.",
      }),
      { status: 500 }
    );
  }
}
