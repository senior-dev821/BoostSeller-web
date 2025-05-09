"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // Correct import for App Router
import Alert from "@/components/ui/alert/Alert"; // Import the Alert component

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
		role:'admin',
  });
	const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'error' | 'success' | 'warning' | 'info'>('error'); // Default to error
	const router = useRouter(); // Initialize useRouter

	const handlePhoneNumberChange = (phoneNumber: string) => {
    setFormData({ ...formData, phoneNumber });
  };

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

	const handleSubmit = async (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
		
		if (!formData.email || !formData.name || !formData.phoneNumber || !formData.password || !(e.target as HTMLFormElement).confirmpassword.value) {
      setAlertTitle('Input Error');
      setAlertMessage('Please fill in all fields.');
      setAlertVariant('error');
      setAlertVisible(true);
      return; // Stop further execution
    }
		if (formData.password !=(e.target as HTMLFormElement).confirmpassword.value) {
      setAlertTitle('Input Error');
      setAlertMessage('Please confirm password again.');
      setAlertVariant('error');
      setAlertVisible(true);
      return; // Stop further execution
    }

    try {
			console.log("form data : ", formData);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
			if (data.error) {
        // Handle login failure (e.g., show an error message)
        setAlertTitle('Registration Failed');
        setAlertMessage(data.message);
        setAlertVariant('error');
        setAlertVisible(true);
      } else {
        // Store the token if needed (e.g., in localStorage or context)
        // localStorage.setItem('token', data.token);
				setAlertTitle('Registration Successful');
        setAlertMessage("Please wait until approved");
        setAlertVariant('success');
        setAlertVisible(true);
        // Redirect to dashboard on success
        setTimeout(() => {
          router.push("/");
        }, 1500); // Redirect after 800 mili seconds
      }
      console.log(data.message); // Handle success (e.g., redirect or show a success message)
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show an error message)
			console.error("Registration error:", error);
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
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
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
              Register
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to Register!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  {/* <!-- First Name --> */}
                    <Label>
                      Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your name"
											// value={formData.name}
                    	onChange={handleChange}
                    />
                  
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
										// value={formData.email}
										onChange={handleChange}
                  />
                </div>
								{/* <!-- Phone Number --> */}
                <div>
                  <Label>
                    Phone Number<span className="text-error-500">*</span>
                  </Label>
                  <PhoneInput
										onChange={handlePhoneNumberChange}
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
											name="password"
											// value={formData.password}
											onChange={handleChange}
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
								{/* <!-- Password Confirm --> */}
                <div>
                  <Label>
                    Password Confirm<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      type={showPassword ? "text" : "password"}
											name="confirmpassword"
											// value={formData.password}
											onChange={handleChange}
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
                
                <div>
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Register
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  href="/"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
