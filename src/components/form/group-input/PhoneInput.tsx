"use client";
import React, { useState } from "react";
import {
  PhoneInput,
  defaultCountries,
} from "react-international-phone";
import "react-international-phone/style.css";

interface CustomPhoneInputProps {
  onChange: (phone: string) => void;
  value?: string;
}

const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  onChange,
  value: externalValue = "+7",
}) => {
  const [value, setValue] = useState(externalValue);

  const handleChange = (phone: string) => {
    setValue(phone);
    onChange(phone);
  };

  return (
    <>
      <style jsx global>{`
        .dark .phone-input input {
          background-color: #111827 !important; /* Tailwind gray-900 */
          color: rgba(255, 255, 255, 0.9) !important;
          border-color: #374151 !important; /* Tailwind gray-700 */
        }

        .dark .phone-input input::placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
        }

        .phone-input input {
          background-color: transparent !important;
          color: #1f2937 !important; /* Tailwind gray-800 */
          border-color: #d1d5db !important; /* gray-300 */
        }

        .phone-input input::placeholder {
          color: #9ca3af !important; /* gray-400 */
        }

        .dark .phone-input .phone-input-country-selector-button {
          background-color: transparent !important;
          color: rgba(255, 255, 255, 0.9) !important;
        }

        .phone-input .phone-input-country-selector-button {
          background-color: transparent !important;
          color: #1f2937 !important;
        }

        .dark .phone-input-dropdown {
          background-color: #111827 !important;
          color: white !important;
          border: 1px solid #374151 !important;
        }

        .phone-input-dropdown {
          background-color: white !important;
          color: black !important;
          border: 1px solid #d1d5db !important;
        }

        .phone-input-dropdown-item {
          background-color: transparent !important;
        }

        .phone-input-dropdown-item:hover {
          background-color: #f3f4f6 !important; /* gray-100 */
        }

        .dark .phone-input-dropdown-item:hover {
          background-color: #1f2937 !important; /* gray-800 */
        }
      `}</style>

      <PhoneInput
        defaultCountry="kz"
        value={value}
        onChange={handleChange}
        countries={defaultCountries}
        className="phone-input w-full"
        inputClassName={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 dark:placeholder:text-white/30 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700`}
      />
    </>
  );
};

export default CustomPhoneInput;
