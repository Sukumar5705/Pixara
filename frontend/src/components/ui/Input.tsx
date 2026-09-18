import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, registration, id, icon, type = "text", ...props }, ref) => {
    const inputId = id ?? registration.name;
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col">
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-bold text-[#111B33]">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586982]">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={currentType}
            {...registration}
            {...props}
            ref={(e) => {
              registration.ref(e);
              if (typeof ref === "function") {
                ref(e);
              } else if (ref) {
                ref.current = e;
              }
            }}
            className={`h-[44px] w-full rounded-xl border bg-white ${
              icon ? "pl-11" : "pl-3.5"
            } ${
              isPassword ? "pr-11" : "pr-3.5"
            } text-[14px] text-[#111B33] placeholder:text-[#8290A5] outline-none transition-all duration-150 ${
              error
                ? "border-[#DC4C4C] ring-4 ring-[#DC4C4C]/10"
                : "border-[#E4E8EE] focus:border-[#1769FF] focus:ring-4 focus:ring-[#1769FF]/10"
            }`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#586982] transition-colors hover:text-[#1769FF] focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-[12px] font-medium text-[#DC4C4C]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
