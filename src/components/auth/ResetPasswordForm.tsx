"use client";
import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Step 1: Send OTP
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (result.error) {
        alert(result.message);
        return;
      }

      // Step 2: Save data to sessionStorage
      sessionStorage.setItem(
        "pendingVerify",
        JSON.stringify({
          email,
          password,
          context: "reset",
        })
      );

      // Step 3: Redirect to verify page
      router.push("/twostepverify");
    } catch (err) {
      console.error("Reset password error:", err);
      alert("Something went wrong. Please try again.");
    } finally {

    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your new password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6 mt-5">
            <div>
						<Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
						<div>
              <Label>
                New Password <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Enter your new password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>
                Confirm Password <span className="text-error-500">*</span>
              </Label>
              <Input
                type="confirmPassword"
                placeholder="Confirm your new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <Button className="w-full" size="sm">
                Reset Password
              </Button>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Remembered your password?{" "}
              <Link
                href="/login"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
