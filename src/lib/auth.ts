// lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'; // App Router only
const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export async function getUserFromToken() {
  const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { id: number; email: string; role: string, userId: number, };
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
