import React from "react";
import { ArrowRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", children, isLoading, loadingText, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        style={{
          background: isLoading || disabled ? undefined : "#1769FF",
          boxShadow: "0 4px 20px rgba(23,105,255,0.30)",
        }}
        className={`group relative flex h-[44px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#1769FF] px-6 text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#0F5BE7] hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{loadingText ?? "Loading..."}</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
