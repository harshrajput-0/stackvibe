import { cn } from "@/lib/utils/cn";

/**
 * Error text for a form or a single field. Renders nothing when empty, so it
 * can always be placed in the markup: <FormError>{error}</FormError>
 */
export function FormError({ id, className, children }) {
  if (!children) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn("mt-4 text-[12.5px] text-red-600", className)}
    >
      {children}
    </p>
  );
}
