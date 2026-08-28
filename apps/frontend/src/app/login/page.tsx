"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "Please verify your email before logging in") {
          router.push(`/verify?email=${encodeURIComponent(data.email)}`);
          return;
        }
        throw new Error(result.error || "Failed to log in");
      }

      router.push("/dashboard"); // Navigate to the protected page
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-outline-variant/30 p-8">
        <div className="text-center mb-8">
          <h1 className="font-jakarta text-[32px] font-bold text-primary">Ehastakshar</h1>
          <p className="font-inter text-body-md text-on-surface-variant mt-2">
            Log in to your account
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded text-sm font-inter">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block font-inter text-label-md font-semibold text-primary mb-1">
              Email Address
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="ajay@example.com"
              error={errors.email?.message}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block font-inter text-label-md font-semibold text-primary mb-1">
              Password
            </label>
            <PasswordInput
              {...register("password")}
              placeholder="Enter your password"
              error={errors.password?.message}
              disabled={isLoading}
              showRules={false}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0D9488] text-white py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.98] hover:bg-[#0f766e] disabled:opacity-70 disabled:active:scale-100 shadow-md mt-6"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-inter text-on-surface-variant">
          Don't have an account?{" "}
          <Link href="/signup" className="text-secondary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
