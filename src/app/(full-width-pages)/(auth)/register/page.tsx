import SignUpForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | BoostSeller",
  description: "Register Page for BoostSeller",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
