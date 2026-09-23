import { cn } from "@/lib/utils/cn";

/**
 * Small inline loading spinner. Inherits size from `size` (px) and picks
 * its colours from `tone`: "light" for use on dark buttons, "dark" elsewhere.
 */
export function Spinner({ size = 14, tone = "light", className }) {
  return (
    <span
      role="presentation"
      style={{ width: size, height: size }}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-2",
        tone === "light"
          ? "border-white/35 border-t-white"
          : "border-(--gray-200) border-t-(--black)",
        className,
      )}
    />
  );
}
