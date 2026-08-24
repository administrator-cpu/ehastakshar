import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <input
          {...props}
          ref={ref}
          className={`w-full px-4 py-3 bg-surface-container-lowest border rounded outline-none transition-colors duration-200 ease-out-ui font-inter text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary ${
            error ? "border-red-500" : "border-outline-variant"
          } ${className}`}
        />
        {error && <span className="text-red-500 text-sm font-inter">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
