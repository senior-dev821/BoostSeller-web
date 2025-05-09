"use client";
import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

export default function TwoStepVerification() {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle two-step verification logic here
    console.log("Verification code submitted:", code);
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Two Step Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
						A verification code has been sent to your mail.<br></br>
            Please enter it in the field below.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6 mt-5">
            <div>
              <Label>
                Verification Code <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter your verification code"
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <Button className="w-full" size="sm">
                Verify Code
              </Button>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Didn&apos;t receive a code?{" "}
              <Link
                href="/forgotpassword"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Resend Code
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
