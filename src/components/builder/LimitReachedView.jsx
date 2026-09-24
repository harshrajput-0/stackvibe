import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Shown when the free AI model's shared rate limit stops generation
// partway through. Nothing is lost — every file written so far is already
// saved on the project — so this is framed as a pause, not a failure.
export function LimitReachedView({
  doneCount,
  total,
  isResuming,
  onResume,
  onBackToProjects,
}) {
  const segments = 6;
  const filled =
    total > 0 ? Math.round((doneCount / total) * segments) : 0;

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6.5">
      <div
        role="alert"
        className="w-full max-w-115 rounded-lg border border-gray-200 bg-white p-[28px_26px] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      >
        <div className="mb-4 flex h-9.5 w-9.5 items-center justify-center rounded-[10px] border border-gray-200">
          <Clock size={18} strokeWidth={1.8} color="#0A0A0A" />
        </div>

        <h3 className="text-[17px] font-bold tracking-[-0.01em]">
          AI limit reached
        </h3>
        <p className="mt-1.25 text-[13px] text-gray-500">
          The free AI model has hit its limit for now. Your progress is
          saved, so nothing is lost.
        </p>

        <div className="mt-5 flex gap-1" aria-hidden="true">
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-[2px] ${
                i < filled ? "bg-black" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>Files saved</span>
          <b className="font-mono font-medium text-black">
            {doneCount} of {total}
          </b>
        </div>

        <div className="mt-5.5 flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onResume}
            loading={isResuming}
          >
            Resume building
          </Button>
          <Button variant="secondary" size="sm" onClick={onBackToProjects}>
            Back to projects
          </Button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Limits usually clear after a few minutes. Resume only writes the{" "}
          {Math.max(total - doneCount, 0)} missing file
          {Math.max(total - doneCount, 0) === 1 ? "" : "s"}.
        </p>
      </div>
    </div>
  );
}
