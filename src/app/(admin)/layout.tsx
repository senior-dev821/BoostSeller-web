// File: src/app/(admin)/layout.tsx
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import AdminLayoutClient from '@/layout/AdminLayoutClient'; // New client component

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export default  async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;
  let userRole = 'user';

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      userRole = decoded.role || 'user';
    } catch (err) {
      console.error('Invalid JWT token', err);
    }
  }

  return <AdminLayoutClient userRole={userRole}>{children}</AdminLayoutClient>;
}
