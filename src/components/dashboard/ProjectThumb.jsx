import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui";

export function ProjectThumb({ src, className }) {
  return (
    <div
      className={cn(
        "relative flex aspect-16/10 items-center justify-center overflow-hidden border-b border-(--gray-200)",
        src ? "bg-white" : "bg-[#f5f5f5]",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-[30%] items-center justify-center rounded-xl bg-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.12)]">
          <Logo size={34} />
        </div>
      )}
    </div>
  );
}