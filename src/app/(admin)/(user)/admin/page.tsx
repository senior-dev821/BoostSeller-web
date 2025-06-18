import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

import ComponentCard from "@/components/common/ComponentCard";
import AdminForm from "@/components/users/AdminForm";
import { Metadata } from "next";
import React from "react";

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export const metadata: Metadata = {
  title: "Admin | BoostSeller",
  description:
    "This is Admin page for BoostSeller Super Admin Dashboard",
  // other metadata
};

export default async function AdminTables() {

	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

  // 2. Verify token, redirect if invalid or missing
  if (!token) {
    redirect('/login');
  }

  try {
		const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
		if (decoded.role !== 'super') {
      redirect('/login'); // Optional: create an "Unauthorized" page or redirect elsewhere
    }
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
		console.log("Error:",error);
    redirect('/login');
  }

  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Hostess" /> */}
      <div className="space-y-6">
        <ComponentCard title="Hostess">
          <AdminForm />
        </ComponentCard>
      </div>
    </div>
  );
}
