import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

// Shown when generation fails outright before anything was ever produced
// (no planned files at all) — distinct from LimitReachedView, which is for
// a rate limit hit partway through with completed files already saved.
export function GenerationErrorView({
  error,
  isResuming,
  onResume,
  onBackToProjects,
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6.5">
      <div
        role="alert"
        className="w-full max-w-115 rounded-lg border border-gray-200 bg-white p-[28px_26px] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      >
        <div className="mb-4 flex h-9.5 w-9.5 items-center justify-center rounded-[10px] border border-gray-200">
          {isResuming ? (
            <Logo width={18} height={18.4} color="black" animated />
          ) : (
            <AlertTriangle size={18} strokeWidth={1.8} color="#0A0A0A" />
          )}
        </div>

        <h3 className="text-[17px] font-bold tracking-[-0.01em]">
          Generation failed
        </h3>
        <p className="mt-1.25 text-[13px] text-gray-500">
          {error || "Something went wrong while building this project."}
        </p>

        <div className="mt-5.5 flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onResume}
            loading={isResuming}
          >
            Try again
          </Button>
          <Button variant="secondary" size="sm" onClick={onBackToProjects}>
            Back to projects
          </Button>
        </div>
      </div>
    </div>
  );
}
