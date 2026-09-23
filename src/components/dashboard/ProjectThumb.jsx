import { cn } from "@/lib/utils/cn";

/**
 * Project preview image. Shows the uploaded thumbnail when there is one and
 * a striped wireframe placeholder otherwise. Used by project cards and by
 * the edit-details dialog so both always look the same.
 */
export function ProjectThumb({ src, className }) {
  return (
    <div
      className={cn(
        "relative flex aspect-16/10 items-end overflow-hidden border-b border-(--gray-200) p-3",
        src
          ? "bg-white p-0"
          : "bg-[repeating-linear-gradient(135deg,var(--gray-100)_0_2px,var(--gray-50)_2px_14px)]",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <div className="w-full rounded-md border border-gray-200 bg-white p-1.5">
          <div className="mb-1.25 flex gap-0.75">
            <span className="size-1.25 shrink-0 rounded-full bg-(--gray-300)" />
            <span className="size-1.25 shrink-0 rounded-full bg-(--gray-300)" />
            <span className="size-1.25 shrink-0 rounded-full bg-(--gray-300)" />
          </div>
          <div className="mb-1 h-1.25 rounded-xs bg-gray-200" />
          <div className="mb-1 h-1.25 w-[55%] rounded-xs bg-gray-200" />
        </div>
      )}
    </div>
  );
}
