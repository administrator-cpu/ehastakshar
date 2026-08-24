"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 text-primary">
        <span className="material-symbols-outlined text-4xl" data-icon="verified_user">
          verified_user
        </span>
      </div>
      <h1 className="font-jakarta text-[40px] font-bold text-primary mb-4">
        Protected About Page
      </h1>
      <p className="font-inter text-body-lg text-on-surface-variant max-w-xl mb-8">
        You are successfully authenticated and have gained access to this highly secure internal route.
        The Controller-Service-Repository pattern is working perfectly in the backend!
      </p>

      <button
        onClick={handleLogout}
        className="bg-transparent border-2 border-primary text-primary px-8 py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.98] hover:bg-primary/5 shadow-sm"
      >
        Sign Out
      </button>
    </div>
  );
}
