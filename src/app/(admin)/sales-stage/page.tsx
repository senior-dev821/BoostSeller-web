import ComponentCard from "@/components/common/ComponentCard";
import StageForm from "@/components/sales-stage/StageForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Sales Stages | BoostSeller",
  description:
    "This is Sales Stage page for BoostSeller Admin Dashboard",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Hostess" /> */}
      <div className="space-y-6">
        <ComponentCard title="Sales Stage">
          <StageForm />
        </ComponentCard>
      </div>
    </div>
  );
}
