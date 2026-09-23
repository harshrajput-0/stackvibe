"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FormError } from "./FormError";

/** Label text used above form controls (also for non-<input> controls). */
export function FieldLabel({ htmlFor, className, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.75 block text-[13px] font-semibold text-(--gray-800)",
        className,
      )}
    >
      {children}
    </label>
  );
}

/**
 * Small helper text shown under a field. `met` turns it green with a check,
 * used for live requirements like "Use 8 or more characters."
 */
export function FieldHint({ met = false, className, children }) {
  return (
    <p
      className={cn(
        "mt-1.5 text-[12.5px]",
        met ? "text-green-700" : "text-(--gray-500)",
        className,
      )}
    >
      {met && <span aria-hidden="true">✓&nbsp;</span>}
      {children}
    </p>
  );
}

/**
 * Input
 *
 * variant:      "text" | "email" | "password"
 * error:        error message; also switches on the red state
 * hint:         helper text shown while there is no error (string or <FieldHint />)
 * labelAction:  node aligned to the right of the label (e.g. a link)
 * prefix:       fixed text shown inside the field before the value (e.g. "stackvibe.app/")
 * className:    classes for the outer wrapper (replaces the default `my-5` spacing)
 * inputClassName: extra classes for the <input> itself
 *
 * Usage:
 * <Input label="Full name" variant="text" placeholder="Jane Doe" />
 * <Input label="Email" variant="email" placeholder="jane@company.com" error="Enter a valid email" />
 * <Input label="Password" variant="password" hint="Use 8 or more characters." />
 * <Input label="Slug" prefix="stackvibe.app/" />
 */
export const Input = ({
  label,
  labelAction,
  variant = "text",
  placeholder,
  error,
  hint,
  prefix,
  value,
  onChange,
  name,
  id,
  disabled = false,
  className = "my-5",
  inputClassName,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, "-");
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  const isPassword = variant === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : variant;

  const fieldClasses = cn(
    "h-11 w-full rounded-md border bg-white text-sm text-(--gray-900)",
    "transition-[border-color,box-shadow] duration-150 ease-out",
    error ? "border-red-600" : "border-(--gray-300)",
  );

  const inputEl = (
    <input
      id={inputId}
      name={name}
      type={inputType}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={describedBy}
      className={cn(
        "placeholder:text-(--gray-400) disabled:cursor-not-allowed disabled:bg-(--gray-50) disabled:text-(--gray-400)",
        prefix
          ? "h-full min-w-0 flex-1 bg-transparent pr-3.5 pl-0.5 outline-none!"
          : cn(
              fieldClasses,
              "px-3.5 focus:border-black focus:shadow-[0_0_0_3px_rgba(10,10,10,0.08)] focus-visible:outline-none!",
              error && "focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]",
              isPassword && "pr-11",
            ),
        inputClassName,
      )}
      {...rest}
    />
  );

  return (
    <div className={className}>
      {(label || labelAction) && (
        <div className="flex items-baseline justify-between">
          {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
          {labelAction}
        </div>
      )}

      <div className="relative">
        {prefix ? (
          <div
            className={cn(
              fieldClasses,
              "flex items-center overflow-hidden focus-within:border-black focus-within:shadow-[0_0_0_3px_rgba(10,10,10,0.08)]",
            )}
          >
            <span className="flex-none pl-3.5 font-(family-name:--mono) text-[13.5px] text-(--gray-400)">
              {prefix}
            </span>
            {inputEl}
          </div>
        ) : (
          inputEl
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-md text-(--gray-400)! hover:text-black! disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <FormError id={`${inputId}-error`} className="mt-1.5">
          {error}
        </FormError>
      ) : hint ? (
        <div id={`${inputId}-hint`}>
          {typeof hint === "string" ? <FieldHint>{hint}</FieldHint> : hint}
        </div>
      ) : null}
    </div>
  );
};
