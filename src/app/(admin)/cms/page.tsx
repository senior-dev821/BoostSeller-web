// app/(admin)/cms/page.tsx

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { Metadata } from "next";
import React from "react";

import ComponentCard from "@/components/common/ComponentCard";
import CustomTabs from '@/components/ui/CustomTabs';
import HeroTable from '@/components/cms/HeroTable';
import FeaturesTable from '@/components/cms/FeaturesTable';
import WorkingStepsTable from "@/components/cms/WorkingStepsTable";
import AboutTable from '@/components/cms/AboutTable';
import ContactTable from "@/components/cms/ContactTable";
import PricingTable from '@/components/cms/PricingTable';
import TermsTable from "@/components/cms/TermsTable";
import PolicyTable from "@/components/cms/PolicyTable";
import TeamSectionTable from "@/components/cms/TeamSectionTable";
import TestimonialsTable from "@/components/cms/TestimonialsTable";
// Add more as needed

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export const metadata: Metadata = {
  title: "Admin | BoostSeller",
  description:
    "This is Admin page for BoostSeller Super Admin Dashboard",
  // other metadata
};

export default async function CmsDashboard() {

	const tabs = [
    { key: 'hero', label: 'Hero Section', content: <HeroTable /> },
    { key: 'features', label: 'Features', content: <FeaturesTable /> },
		{ key: 'workingsteps', label: 'Working Steps', content: <WorkingStepsTable />},
		{ key: 'abouttable', label: 'About Section', content: <AboutTable />},
		{ key: 'teamtable', label: 'Our Team', content: <TeamSectionTable />},
		{ key: 'testimonialstable', label: 'Testimonials', content: <TestimonialsTable />},
		{ key: 'pricingtable', label: 'Pricing', content: <PricingTable />},
		{ key: 'contacttable', label: 'Contact', content: <ContactTable />},
		{ key: 'termstable', label: 'Terms of Use', content: <TermsTable />},
		{ key: 'policytable', label: 'Privacy Policy', content: <PolicyTable />}
    // Add more tabs here
  ];
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
    <div className="p-6">
			<ComponentCard title="Content Management">
				<CustomTabs tabs={tabs} />
			</ComponentCard>		
    </div>
  );
}
