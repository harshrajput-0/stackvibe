import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "bg-[var(--gray-800)]! text-white! hover:bg-[var(--black)]!",
  secondary: "border border-[var(--gray-300)] bg-white text-[var(--black)]! hover:bg-white/85",
  outline: "border border-[var(--gray-300)] bg-transparent text-[var(--gray-50)] hover:bg-[var(--gray-50)] hover:text-[var(--black)]!",
  ghost: "bg-transparent text-[var(--gray-700)] hover:text-[var(--black)]",
  social: "border! border-[var(--gray-300)]! text-[var(--black)]! hover:bg-[var(--gray-800)]! hover:text-white!"
};

const sizes = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-3.5 text-[13px]",
  icon: "size-9 px-0 rounded-[var(--radius-sm)]",
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  href,
  className,
  disabled = false,
  block = false,
  ...props
}) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-[var(--radius-md)]",
    "font-semibold tracking-[-0.01em]",
    "whitespace-nowrap",
    "transition-[background,color,border-color,transform]",
    "duration-150",
    "active:scale-[0.98]",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    block && "w-full",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}