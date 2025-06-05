import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';


import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import WorkloadHeatmap from "@/components/dashboard/WorkloadHeatmap";

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export const metadata: Metadata = {
  title:
    "Dashboard | BoostSeller",
  description: "This is Dashboard for BoostSeller Admin",
};

export default async function Ecommerce() {

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
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <MonthlySalesChart />
				<EcommerceMetrics />
      </div>

      <div className="col-span-12 xl:col-span-5">
				<RecentOrders />
      </div>
      <div className="col-span-12 xl:col-span-7">
				<StatisticsChart />
      </div>
			<div className="col-span-12 xl:col-span-5">
				<WorkloadHeatmap />
      </div>
    </div>
  );
}
