"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
// import { useRouter } from "next/router"; // Import useRouter
import { useRouter } from 'next/navigation'; // Correct import for App Router
import Alert from "@/components/ui/alert/Alert"; // Import the Alert component

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
	const [alertVariant, setAlertVariant] = useState<'error' | 'success' | 'warning' | 'info'>('error');
	const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    const email = (e.currentTarget as HTMLFormElement).email.value; // Get email from input
  	const password = (e.currentTarget as HTMLFormElement).password.value; // Get password from input

		if (!email && !password) {
      setAlertTitle('Input Error');
      setAlertMessage('Please fill in all fields.');
      setAlertVariant('error');
      setAlertVisible(true);
      return; // Stop further execution
    }
		else if (!email) {
      setAlertTitle('Input Error');
      setAlertMessage('Please fill in email field.');
      setAlertVariant('error');
      setAlertVisible(true);
      return; // Stop further execution
    }
		else if (!password) {
      setAlertTitle('Input Error');
      setAlertMessage('Please fill in password field.');
      setAlertVariant('error');
      setAlertVisible(true);
      return; // Stop further execution
    }

    try {
      const response = await fetch('/api/admin/auth/login', { // Adjust the URL to your API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.error) {
        // Handle login failure (e.g., show an error message)
        setAlertTitle('Login Failed');
        setAlertMessage(data.message);
        setAlertVariant('error');
        setAlertVisible(true);
      } else {
        // Store the token if needed (e.g., in localStorage or context)
        localStorage.setItem('token', data.token);
				setAlertTitle('Login Successful');
        setAlertMessage("Redirecting to dashboard...");
        setAlertVariant('success');
        setAlertVisible(true);
        // Redirect to dashboard on success
        setTimeout(() => {
          router.push("/dashboard");
        }, 800); // Redirect after 800 mili seconds
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertTitle('Error');
      setAlertMessage("An error occurred. Please try again.");
      setAlertVariant('error'); 
      setAlertVisible(true);
    }
  };

	const handleAlertClose = () => {
    setAlertVisible(false); // Hide the alert
  };

	useEffect(() => {
    if (alertVisible) {
      const timer = setTimeout(() => {
        setAlertVisible(false);
      }, 2500); // Close alert after 2 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [alertVisible]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
			
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
			{alertVisible && (
        <Alert
          variant={alertVariant}
          title={alertTitle}
          message={alertMessage}
          showLink={false} // Set to true if you want to show a link
          onClose={handleAlertClose} // Handle alert close
        />
      )}
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Log In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input name="email" placeholder="info@gmail.com" type="email" />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password" // Add name attribute
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/forgotpassword"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Log in
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/register"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
			
    </div>
  );
}
