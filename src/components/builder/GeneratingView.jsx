import { AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui";
import { useGenerationMessages } from "@/hooks/useGenerationMessages";

export function GeneratingView({
  projectName,
  percent,
  doneCount,
  total,
  fileStatuses,
  plannedFiles = [],
  error,
  onRetry,
}) {
  const isPlanning = !error && total === 0;
  const phase = error ? null : isPlanning ? "planning" : "building";
  const { message, showSlowNote } = useGenerationMessages(phase);

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6.5">
      <div className="w-full max-w-115 rounded-lg border border-gray-200 bg-white p-[28px_26px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {error ? (
          <ErrorState
            projectName={projectName}
            error={error}
            onRetry={onRetry}
          />
        ) : (
          <>
            <h3 className="text-[17px] font-bold tracking-[-0.01em]">
              AI Agent is building…
            </h3>
            <p className="mt-1.25 text-[13px] text-gray-500">
              Writing production-ready code for <strong>{projectName}</strong>
            </p>

            <div className="mt-5.5 flex items-center justify-between text-[11px] font-semibold tracking-[0.04em] text-gray-400">
              <span>PROGRESS</span>
              <span className="font-mono text-black">
                {isPlanning ? "Planning" : `${percent}%`}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-black transition-[width] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${isPlanning ? 28 : percent}%`, opacity: isPlanning ? 0.5 : 1 }}
              />
            </div>

            <ActivityPanel message={message} showSlowNote={showSlowNote} />

            <div className="mt-5.5 text-[11px] font-semibold tracking-[0.04em] text-gray-400">
              {isPlanning
                ? "DECIDING WHICH FILES TO CREATE"
                : `PLANNED FILES (${doneCount}/${total})`}
            </div>
            <div className="mt-2.5 max-h-65 overflow-y-auto rounded-md border border-gray-200 bg-white p-1.5 text-left">
              {isPlanning ? (
                <SkeletonFiles />
              ) : (
                plannedFiles.map((file, index) => {
                  const status = fileStatuses[index];
                  return (
                    <div
                      className="flex items-start gap-2.5 rounded-md border-t border-t-gray-100 px-2.5 py-2.25 first:border-t-0"
                      key={file.path}
                    >
                      <span className="mt-px flex h-3.75 w-3.75 flex-none items-center justify-center">
                        {status === "done" ? (
                          <Check size={13} strokeWidth={1.8} color="#0A0A0A" />
                        ) : status === "active" ? (
                          <span className="h-3.25 w-3.25 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-gray-200 border-t-black" />
                        ) : (
                          <span className="h-1.75 w-1.75 rounded-full bg-gray-300" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`font-mono text-xs transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            status === "done" || status === "active"
                              ? "text-black"
                              : "text-gray-300"
                          }`}
                        >
                          {file.path}
                        </div>
                        <div className="mt-0.5 line-clamp-1 text-[11.5px] leading-[1.4] text-gray-400">
                          {file.description}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Small calm activity readout between the progress bar and the file list.
// One line of rotating status text, plus — after a while — a note that
// free models can be slow. The fade-in keyframe is defined once in
// globals.css, which also collapses it under prefers-reduced-motion —
// same as the spinner above, no per-component check needed here.
function ActivityPanel({ message, showSlowNote }) {
  return (
    <div className="mt-5 rounded-md border border-gray-200 bg-gray-100 px-3.5 py-3">
      <div
        key={message}
        className="animate-[fade-in_0.4s_var(--ease)] text-[13px] font-medium text-gray-700"
      >
        {message}
      </div>
      <div
        className={`mt-1 text-xs text-gray-500 transition-opacity duration-500 ${
          showSlowNote ? "opacity-100" : "opacity-0"
        }`}
      >
        Free models can be slow at busy times. Your project is still being
        built.
      </div>
    </div>
  );
}

// Placeholder rows shown while the plan itself is still being decided
// (no file list to render yet).
function SkeletonFiles() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div className="flex items-center gap-2.5 px-2.5 py-2.5" key={i}>
          <span className="h-1.75 w-1.75 flex-none rounded-full bg-gray-300" />
          <div
            className="h-3 flex-1 animate-pulse rounded bg-gray-200"
            style={{ maxWidth: `${(55 + i * 7) % 80}%` }}
          />
        </div>
      ))}
    </>
  );
}

function ErrorState({ projectName, error, onRetry }) {
  return (
    <div>
      <div className="mb-4 flex h-9.5 w-9.5 items-center justify-center rounded-[10px] border border-gray-200">
        <AlertTriangle size={18} strokeWidth={1.8} color="#0A0A0A" />
      </div>
      <h3 className="text-[17px] font-bold tracking-[-0.01em]">
        Generation failed
      </h3>
      <p className="mt-1.25 text-[13px] text-gray-500">
        <strong>{projectName}</strong> couldn&apos;t be generated.
      </p>
      <p className="mt-3 rounded-md border border-gray-200 bg-gray-100 px-3 py-2.5 text-[13px] leading-relaxed text-gray-700">
        {error}
      </p>
      {onRetry && (
        <div className="mt-5.5">
          <Button variant="primary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
