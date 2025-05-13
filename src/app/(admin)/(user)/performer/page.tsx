import ComponentCard from "@/components/common/ComponentCard";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PerformerForm from "@/components/users/PerformerForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Performer | BoostSeller",
  description:
    "This is Performer page for BoostSeller Admin Dashboard",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Performers" /> */}
      <div className="space-y-6">
        <ComponentCard title="Performers">
          <PerformerForm />
        </ComponentCard>
      </div>
    </div>
  );
}
