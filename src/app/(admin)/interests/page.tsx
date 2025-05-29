import ComponentCard from "@/components/common/ComponentCard";
import InterestsForm from "@/components/interests/InterestsForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Interests | BoostSeller",
  description:
    "This is Interests page for BoostSeller Admin Dashboard",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Hostess" /> */}
      <div className="space-y-6">
        <ComponentCard title="Interests">
          <InterestsForm />
        </ComponentCard>
      </div>
    </div>
  );
}
