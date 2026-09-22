import { cn } from "@/lib/utils/cn";

/** Centred max-width wrapper shared by the landing header, hero and footer. */
export function Container({ as: Tag = "div", className, ...props }) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-300 px-12 max-[720px]:px-5",
        className,
      )}
      {...props}
    />
  );
}
