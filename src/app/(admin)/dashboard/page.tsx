import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import WorkloadHeatmap from "@/components/dashboard/WorkloadHeatmap";

export const metadata: Metadata = {
  title:
    "Dashboard | BoostSeller",
  description: "This is Dashboard for BoostSeller Admin",
};

export default function Ecommerce() {
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
