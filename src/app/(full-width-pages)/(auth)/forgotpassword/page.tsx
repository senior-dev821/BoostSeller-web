import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | BoostSeller",
  description: "Forgot Password page for BoostSeller",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
