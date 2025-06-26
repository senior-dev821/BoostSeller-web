"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from 'jwt-decode';


export default function UserMetaCard() {
  
  const [userData, setUserData] = useState({
      name: '',
      role: '',
      email: '',
      phone: '',
      avatarPath: '',
      endDate: '',
  });

  const [userId, setUserId] = useState<number | null>(null);

  const nextServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode<{ userId?: number }>(token);
      if (decoded.userId !== undefined) {
        setUserId(decoded.userId);
      }
    } catch (err) {
      console.error('Invalid token', err);
    }
  }, []);

  // fetch user data once userId is set
  useEffect(() => {
    if (userId === null) return;

    async function fetchUser() {
      try {
        const res = await fetch('/api/admin/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        setUserData(data.profile);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    }

    fetchUser();
  }, [userId]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!userId) {
      console.error("Invalid user ID.");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("profile_image", file); // ✅ match backend
    formData.append("userId", userId.toString()); // ✅ match backend

    try {
      const res = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.error) {
        console.error(result.message);
        return;
      }

      setUserData(prev => ({
        ...prev,
        avatarPath: result.imageUrl, // ✅ match backend response
      }));

    } catch (err) {
      console.error("Upload failed", err);
    }
    
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC", // 👈 Force consistent timezone display
    });
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            
            <div className="relative w-20 h-20">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Image
                  width={80}
                  height={80}
                  src={ userData.avatarPath
                                      ? `${nextServerUrl}${userData.avatarPath}`
                                      : "/images/user/avatar_admin.png"}
                  alt="user"
                  className="rounded-full border border-gray-300 dark:border-gray-700"
                />
                <div className="absolute bottom-0 right-0 bg-gray-100 p-0.5 rounded-full shadow">
                  ✏️
                </div>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={ handleAvatarChange }
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userData.name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {
                    userData.role === 'admin' ? 'Administrator' : 'Super Admin'
                  }
                </p>
              </div>
            </div>
            
          </div>
           {userData.endDate && (
            <div className="flex-shrink-0">
              <div
                className="px-4 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full italic shadow-sm whitespace-nowrap"
                title={`Access valid through ${formatDate(userData.endDate)}`}
              >
               Approval expires on <span className="font-semibold">{formatDate(userData.endDate)}</span>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </>
  );
}
