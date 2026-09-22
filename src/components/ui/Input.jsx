"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Input
 *
 * variant: "text" | "email" | "password"
 *
 * Usage:
 * <Input label="Full name" variant="text" placeholder="Jane Doe" />
 * <Input label="Email" variant="email" placeholder="jane@company.com" error="Enter a valid email" />
 * <Input label="Password" variant="password" placeholder="********" />
 */
export const Input = ({
  label,
  variant = "text",
  placeholder,
  error,
  value,
  onChange,
  name,
  id,
  disabled = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, "-");

  const isPassword = variant === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : variant;

  return (
    <div className="my-5">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.75 block text-[13px] font-semibold text-gray-800"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`h-11 w-full rounded-md border bg-white px-3.5 text-sm text-gray-900
            placeholder:text-gray-400
            transition-colors duration-150 ease-out
            focus:outline-none focus:border-black
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400
            ${isPassword ? "pr-11" : ""}
            ${error ? "border-red-600" : "border-gray-300"}`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={disabled}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-[12.5px] text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
};
