"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TwoStepVerification() {
  const [code, setCode] = useState("");
  const [userData, setUserData] = useState("");

  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem("pendingVerify");
    if (saved) {
      setUserData(JSON.parse(saved));
    } else {
      router.push("/register");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;



    try {
      // 1. Verify OTP
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          code,
          context: userData.context,
        }),
      });

      const verifyResult = await verifyRes.json();
      if (verifyResult.error) {
        alert(verifyResult.message);

        return;
      }

      // 2. Continue based on context
      if (userData.context === "register") {
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        const registerResult = await registerRes.json();
        if (registerResult.error) {
          alert(registerResult.message);

          return;
        }
      }

      if (userData.context === "reset") {
        const resetRes = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
          }),
        });

        const resetResult = await resetRes.json();
        if (resetResult.error) {
          alert(resetResult.message);

          return;
        }
      }

      // 3. Cleanup & redirect
      sessionStorage.removeItem("pendingVerify");
      router.push("/login");
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {

    }
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
