import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "bg-gray-800! text-white! hover:bg-black!",
  secondary: "border border-gray-300 bg-white text-black! hover:bg-white/85",
  outline: "border border-gray-300 bg-transparent text-gray-50 hover:bg-gray-50 hover:text-black!",
  ghost: "bg-transparent text-gray-700 hover:text-black",
  social: "border! border-gray-300! text-black! hover:bg-[#262626]! hover:text-white!"
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