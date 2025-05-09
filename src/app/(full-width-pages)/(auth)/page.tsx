import SignInForm from "@/components/auth/LogInForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "LogIn | BoostSeller",
  description: "Log In page for BoostSeller",
};

export default function SignIn() {
  return <SignInForm />;
}
