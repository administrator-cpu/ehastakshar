"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Calendar, ShieldCheck, LogOut, Loader2, ArrowLeft } from "lucide-react";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  isEmailVerified: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data.profile);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 text-slate-900 font-sans p-4 md:p-8 w-full min-h-screen flex flex-col">
        <div className="w-full max-w-none mx-auto space-y-8 flex-grow flex flex-col">
          <nav className="flex items-center space-x-4 mb-4">
            <div className="w-48 h-8 bg-slate-200 rounded animate-pulse"></div>
          </nav>

          {/* Profile Card Skeleton */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-32 bg-slate-200 animate-pulse"></div>
            
            <div className="px-8 pb-8 relative">
              <div className="absolute -top-12 border-4 border-white bg-slate-200 animate-pulse w-24 h-24 rounded-full shadow-md"></div>
              
              <div className="pt-16 pb-6 border-b border-slate-100 flex flex-col gap-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse w-48 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-64"></div>
              </div>

              <div className="py-6 space-y-6">
                <div className="h-6 bg-slate-200 rounded animate-pulse w-40 mb-2"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 h-24 animate-pulse"></div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 h-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone Skeleton */}
          <div className="pt-4 mb-20 mt-auto">
            <div className="bg-white border border-slate-100 p-8 rounded-xl shadow-sm h-40 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-200 text-center max-w-md w-full">
          <p className="font-semibold text-lg mb-2">Unable to load profile</p>
          <p className="text-sm opacity-80 mb-6">{error}</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-red-700 hover:underline font-medium"
          >
            <ArrowLeft size={16} className="mr-2" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-slate-50 text-slate-900 font-sans p-4 md:p-8 w-full min-h-screen flex flex-col">
      <div className="w-full max-w-none mx-auto space-y-8 flex-grow flex flex-col">
        <nav className="flex items-center space-x-4 mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Account Profile
          </h1>
        </nav>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Cover Header */}
          <div className="h-32 bg-gradient-to-r from-teal-500 to-indigo-600"></div>
          
          <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div className="absolute -top-12 border-4 border-white bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center text-slate-400 shadow-md">
              <User size={48} />
            </div>

            <div className="pt-16 pb-6 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <div className="flex items-center text-slate-500 mt-1 font-medium">
                  <Mail size={16} className="mr-2 opacity-70" />
                  {profile.email}
                </div>
              </div>

            </div>

            <div className="py-6 space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Account Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-colors hover:border-slate-300">
                  <div className="flex items-center text-slate-400 mb-2">
                    <User size={18} className="mr-2" />
                    <span className="text-sm font-medium">Full Name</span>
                  </div>
                  <p className="text-slate-900 font-semibold text-lg">
                    {profile.firstName} {profile.lastName}
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-colors hover:border-slate-300">
                  <div className="flex items-center text-slate-400 mb-2">
                    <Calendar size={18} className="mr-2" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <p className="text-slate-900 font-semibold text-lg">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 mb-20">
          <div className="bg-white border border-red-100 p-8 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Logging out will end your current session and require you to sign in again.
            </p>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center border border-red-100 justify-center px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold rounded-xl transition-colors duration-200 w-full sm:w-auto disabled:opacity-50 hover:cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 size={20} className="animate-spin mr-2" />
              ) : (
                <LogOut size={20} className="mr-2" />
              )}
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
