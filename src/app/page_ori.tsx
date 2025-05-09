import LandingPageForm from "@/components/landing/landingPage";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "BoostSeller",
  description: "This is Landing Page BoostSeller Dashboard",
};

export default function LandingPage() {
  return (
    <div>
      <LandingPageForm />
        
    </div>
  );
}
