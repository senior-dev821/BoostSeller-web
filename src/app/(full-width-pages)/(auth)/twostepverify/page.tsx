import TwoStepVerificationForm from "@/components/auth/TwoStepVerificationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two-Step Verification | BoostSeller",
  description: "Two-Step Verification page for BoostSeller",
};

export default function TwoStepVerificationPage() {
  return <TwoStepVerificationForm />;
}
