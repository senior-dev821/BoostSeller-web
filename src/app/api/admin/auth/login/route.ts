
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// // import { PrismaClient } from '@prisma/client';
// // const prisma = new PrismaClient();
// import { prisma } from '@/lib/prisma';
// const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json()

// 		// console.log("email = ", email);
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return new Response(JSON.stringify({error: true, message: "User not found" }), {});
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return new Response(JSON.stringify({ error: true, message: "Password is Invalid. \n Please enter correct password." }), {});
//     }

//     const token = jwt.sign(
// 			{
// 				id: user.id,
// 				email: user.email,
// 				role: user.role // Add role to payload
// 			},
// 			JWT_SECRET,
// 			{ expiresIn: '7d' }
// 		);
		
//     return new Response(JSON.stringify({
//       error: false,
//       message: "Logged in successfully!",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
// 				phone_number: user.phoneNumber,
//         is_verified: user.isVerified,
//         is_approved: user.isApproved,
//       }
//     }), {
//       status: 200,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return new Response(JSON.stringify({error: true, message: "Failed to login \n Please try again." }), {});
//   }
// }


import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
import { prisma } from '@/lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

		// console.log("email = ", email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({error: true, message: "User not found" }), {});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: true, message: "Password is Invalid. \n Please enter correct password." }), {});
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' } // Optional: adjust token lifespan
    );

    const responseHeaders = new Headers({
      'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${
        process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict;' : ''
      }`,
      'Content-Type': 'application/json',
    });

    return new Response(JSON.stringify({
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
      }
    }), {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({error: true, message: "Failed to login \n Please try again." }), {});
  }
}