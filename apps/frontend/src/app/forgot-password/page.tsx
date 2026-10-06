"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
});
type RequestForm = z.infer<typeof requestSchema>;

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});
type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

const resetSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  const verifyForm = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const onRequestSubmit = async (data: RequestForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429 && result.retryAfter) {
          setCooldown(result.retryAfter);
          toast.error(result.error);
          return;
        }
        throw new Error(result.error || "Failed to request OTP");
      }

      toast.success(result.message);
      setEmail(data.email);
      setStep(2);
      setCooldown(60); // Initialize default cooldown visually for resends
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Failed to request OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (data: VerifyOtpForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify OTP");
      }

      toast.success("OTP verified successfully!");
      setOtp(data.otp);
      setStep(3);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      toast.success("Password reset successfully! You can now log in.");
      router.push("/login");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429 && result.retryAfter) {
          setCooldown(result.retryAfter);
          toast.error(result.error);
          return;
        }
        throw new Error(result.error || "Failed to resend OTP");
      }

      toast.success("OTP resent successfully!");
      setCooldown(60);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-outline-variant/30 p-8">
        
        <button 
          onClick={() => {
            if (step === 3) setStep(2);
            else if (step === 2) setStep(1);
            else router.push("/login");
          }} 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>

        <div className="text-center mb-8">
          <h1 className="font-jakarta text-[28px] font-bold text-primary">Reset Password</h1>
          <p className="font-inter text-body-md text-on-surface-variant mt-2">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create your new secure password"}
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded text-sm font-inter">
            {serverError}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-5">
            <div>
              <label className="block font-inter text-label-md font-semibold text-primary mb-1">
                Email Address
              </label>
              <Input
                {...requestForm.register("email")}
                type="email"
                placeholder="ajay@example.com"
                error={requestForm.formState.errors.email?.message}
                disabled={isLoading || cooldown > 0}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full brand-gradient text-white py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.98] hover:opacity-90 disabled:opacity-70 disabled:active:scale-100 shadow-md mt-6"
            >
              {isLoading ? "Sending OTP..." : cooldown > 0 ? `Wait ${cooldown}s` : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-5">
            <div>
              <label className="block font-inter text-label-md font-semibold text-primary mb-1">
                One-Time Password (OTP)
              </label>
              <Input
                {...verifyForm.register("otp")}
                type="text"
                placeholder="123456"
                maxLength={6}
                error={verifyForm.formState.errors.otp?.message}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full brand-gradient text-white py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.98] hover:opacity-90 disabled:opacity-70 disabled:active:scale-100 shadow-md mt-6"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Didn't receive the OTP?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isLoading}
                className="text-amber-600 font-semibold hover:underline disabled:text-slate-400 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </p>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
            <div>
              <label className="block font-inter text-label-md font-semibold text-primary mb-1">
                New Password
              </label>
              <PasswordInput
                {...resetForm.register("newPassword")}
                placeholder="Enter your new password"
                error={resetForm.formState.errors.newPassword?.message}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full brand-gradient text-white py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.98] hover:opacity-90 disabled:opacity-70 disabled:active:scale-100 shadow-md mt-6"
            >
              {isLoading ? "Resetting Password..." : "Set New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
