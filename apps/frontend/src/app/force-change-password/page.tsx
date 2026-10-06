"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/ui/PasswordInput";

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ForceChangePasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Note: We don't verify if they should be here on the client-side 
  // perfectly, but if the API call succeeds, they are good. 
  // If they don't have a token, the API will reject.

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/change-temp-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword: data.newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password");
      }

      window.location.href = "/dashboard"; // Hard navigation
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-outline-variant/30 p-8">
        <div className="text-center mb-8">
          <h1 className="font-jakarta text-[28px] font-bold text-primary">Action Required</h1>
          <p className="font-inter text-body-md text-on-surface-variant mt-2">
            For security reasons, you must change your temporary password to continue.
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
              New Password
            </label>
            <PasswordInput
              {...register("newPassword")}
              placeholder="Enter new password"
              error={errors.newPassword?.message}
              disabled={isLoading}
              showRules={true}
            />
          </div>

          <div>
            <label className="block font-inter text-label-md font-semibold text-primary mb-1">
              Confirm New Password
            </label>
            <PasswordInput
              {...register("confirmPassword")}
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              disabled={isLoading}
              showRules={false}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full brand-gradient text-white py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.98] hover:opacity-90 disabled:opacity-70 disabled:active:scale-100 shadow-md mt-6"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>

      </div>
    </div>
  );
}
