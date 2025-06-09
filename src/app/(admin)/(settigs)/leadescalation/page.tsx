// app/settings/page.tsx
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

import LeadEscalationCard from '@/components/setting/LeadEscalationCard';

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export default async function SettingsPage() {

	const cookieStore = await cookies();
		const token = cookieStore.get('token')?.value;

  // 2. Verify token, redirect if invalid or missing
  if (!token) {
    redirect('/login');
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
		console.log("Error:",error);
    redirect('/login');
  }

  return (
    <main className="h-[70vh]  flex items-center justify-center bg-muted/10 px-4">
      <LeadEscalationCard />
    </main>
  );
}
