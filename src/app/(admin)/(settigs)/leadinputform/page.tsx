import ComponentCard from "@/components/common/ComponentCard";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadInputForm from "@/components/setting/LeadInputForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Lead Input | Settings",
  description:
    "This is Lead Input Setting page for BoostSeller Admin Dashboard",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Hostess" /> */}
      <div className="space-y-6">
        <ComponentCard title="Lead Input Fields">
          <LeadInputForm />
        </ComponentCard>
      </div>
    </div>
  );
}
