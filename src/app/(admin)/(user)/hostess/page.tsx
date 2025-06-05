import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

import ComponentCard from "@/components/common/ComponentCard";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import HostessForm from "@/components/users/HostessForm";
import { Metadata } from "next";
import React from "react";

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export const metadata: Metadata = {
  title: "Hostess | BoostSeller",
  description:
    "This is Hostess page for BoostSeller Admin Dashboard",
  // other metadata
};

export default async function BasicTables() {

	const cookieStore = await cookies();
		const token = cookieStore.get('token')?.value;

  // 2. Verify token, redirect if invalid or missing
  if (!token) {
    redirect('/login');
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    redirect('/login');
  }

  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Hostess" /> */}
      <div className="space-y-6">
        <ComponentCard title="Hostess">
          <HostessForm />
        </ComponentCard>
      </div>
    </div>
  );
}
