import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | BoostSeller",
  description: "Reset Password page for BoostSeller",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
