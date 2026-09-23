import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";

// NOTE: globals.css resets `button { background; border; color }` outside of
// any cascade layer, so utilities that touch those properties need `!` to win.
const variants = {
  primary: "bg-[var(--gray-800)]! text-white! hover:bg-[var(--black)]!",
  secondary:
    "border! border-[var(--gray-300)]! bg-white text-[var(--black)]! hover:bg-white/85",
  outline:
    "border! border-white/20! bg-transparent text-[var(--gray-50)]! hover:bg-[var(--gray-50)]! hover:text-[var(--black)]!",
  ghost: "bg-transparent text-[var(--gray-700)]! hover:text-[var(--black)]!",
  social:
    "border! border-[var(--gray-300)]! text-[var(--black)]! hover:border-[var(--gray-400)]! hover:bg-[var(--gray-50)]!",
  danger:
    "bg-[#dc2626]! text-white! hover:bg-[#b91c1c]! disabled:bg-[var(--gray-200)]! disabled:text-[var(--gray-400)]!",
  // Icon-only styles — pair with size="icon" | "iconSm".
  iconGhost:
    "text-[var(--gray-500)]! hover:bg-[var(--gray-100)]! hover:text-[var(--black)]!",
  overlay:
    "bg-white/90! text-[var(--gray-700)]! shadow-[0_1px_3px_rgba(0,0,0,0.12)] backdrop-blur-[2px] hover:bg-white! hover:text-[var(--black)]!",
};

const sizes = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-3.5 text-[13px]",
  icon: "size-9 px-0 rounded-[var(--radius-sm)]",
  iconSm: "size-7 px-0 rounded-[var(--radius-sm)]",
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  href,
  className,
  disabled = false,
  loading = false,
  block = false,
  ...props
}) {
  const isDisabled = disabled || loading;

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
        aria-disabled={isDisabled}
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
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
