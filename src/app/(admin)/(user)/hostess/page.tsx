import ComponentCard from "@/components/common/ComponentCard";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import HostessForm from "@/components/users/HostessForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Hostess | BoostSeller",
  description:
    "This is Hostess page for BoostSeller Admin Dashboard",
  // other metadata
};

export default function BasicTables() {
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
