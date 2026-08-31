"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showRules?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", error, showRules = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState("");

    const rules = [
      { id: "min", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
      { id: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
      { id: "number", label: "One number", test: (v: string) => /[0-9]/.test(v) },
    ];

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative flex flex-col gap-1 w-full">
        <div className="relative">
          <input
            {...props}
            type={showPassword ? "text" : "password"}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-surface-container-lowest border rounded outline-none transition-colors duration-200 ease-out-ui font-inter text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary ${
              error ? "border-red-500" : "border-outline-variant"
            } ${className}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && <span className="text-red-500 text-sm font-inter">{error}</span>}

        {showRules && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-out-ui ${
              isFocused ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
            }`}
          >
            <div className="bg-surface-container-low p-4 rounded border border-outline-variant/50 shadow-sm flex flex-col gap-2">
              {rules.map((rule) => {
                const isMet = rule.test(value);
                return (
                  <div key={rule.id} className="flex items-center gap-2 text-sm font-inter">
                    <div
                      className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors duration-300 ${
                        isMet ? "bg-green-100 text-green-600" : "bg-surface-variant text-on-surface-variant"
                      }`}
                    >
                      {isMet ? <Check size={12} /> : <X size={12} />}
                    </div>
                    <span className={isMet ? "text-green-700" : "text-on-surface-variant"}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
