"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";

const verifySchema = z.object({
  otp: z.string().length(6, "Verification code must be exactly 6 characters"),
});

type VerifyForm = z.infer<typeof verifySchema>;

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(120);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  });

  // Countdown timer logic
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  const onSubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    setServerError("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: data.otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Verification failed");
      }

      setSuccessMsg("Email verified successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard"); // Go to protected dummy page
      }, 1500);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (remainingSeconds > 0) return;
    setIsLoading(true);
    setServerError("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.status === 429 && result.retryAfter) {
        // Server side relative TTL! Clock-skew safe.
        setRemainingSeconds(result.retryAfter);
        setServerError("Please wait before requesting again.");
      } else if (!response.ok) {
        throw new Error(result.error || "Failed to resend OTP");
      } else {
        setSuccessMsg("A new verification code has been sent.");
        setRemainingSeconds(result.retryAfter || 120);
      }
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null; // Avoid rendering if missing email while redirecting

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-outline-variant/30 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <span className="material-symbols-outlined text-3xl" data-icon="mark_email_read">
              mark_email_read
            </span>
          </div>
          <h1 className="font-jakarta text-[24px] font-bold text-primary">Check your email</h1>
          <p className="font-inter text-body-md text-on-surface-variant mt-2">
            We sent a verification code to <br />
            <strong className="text-primary">{email}</strong>
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded text-sm font-inter">
            {serverError}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded text-sm font-inter">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-inter text-label-md font-semibold text-primary mb-1 text-center">
              Enter 6-digit Code
            </label>
            <Input
              {...register("otp")}
              placeholder="000000"
              error={errors.otp?.message}
              disabled={isLoading || !!successMsg}
              className="text-center tracking-[0.5em] text-2xl uppercase"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !!successMsg}
            className="w-full bg-[#0D9488] text-white py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.98] hover:bg-[#0f766e] disabled:opacity-70 disabled:active:scale-100 shadow-md"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-outline-variant/50 pt-6">
          <p className="text-sm font-inter text-on-surface-variant mb-3">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={remainingSeconds > 0 || isLoading || !!successMsg}
            className="text-secondary font-semibold hover:underline disabled:opacity-50 disabled:no-underline transition-opacity font-inter text-sm"
          >
            {remainingSeconds > 0
              ? `Resend available in ${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60)
                  .toString()
                  .padStart(2, "0")}`
              : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
