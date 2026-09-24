import { Check } from "lucide-react";
import { GenerationActivityPanel } from "./GenerationActivityPanel";

// Skeleton rows shown while the plan itself is still being decided — we
// don't know the file list yet, so there's nothing real to render.
function FileSkeletonRows() {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="flex items-center gap-2.5 px-2.5 py-2.5" key={i}>
          <span className="h-1.75 w-1.75 flex-none rounded-full bg-gray-300" />
          <div
            className="h-3 flex-1 rounded bg-[linear-gradient(90deg,var(--gray-100),var(--gray-200),var(--gray-100))] bg-[length:200%_100%] [animation:skeleton-shimmer_1.3s_linear_infinite]"
            style={{ maxWidth: `${(55 + ((i * 7) % 80)) - i * 3}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function GeneratingView({
  projectName,
  percent,
  doneCount,
  total,
  fileStatuses,
  plannedFiles = [],
}) {
  // Until the plan comes back, `total` is 0 — that's the "planning" phase:
  // no percent, no real file list yet, just calm activity.
  const phase = total > 0 ? "building" : "planning";

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6.5">
      <div className="w-full max-w-115 rounded-lg border border-gray-200 bg-white p-[28px_26px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <h3 className="text-[17px] font-bold tracking-[-0.01em]">
          AI Agent is building…
        </h3>
        <p className="mt-1.25 text-[13px] text-gray-500">
          Writing production-ready code for <strong>{projectName}</strong>
        </p>

        <div className="mt-5.5 flex items-center justify-between text-[11px] font-semibold tracking-[0.04em] text-gray-400">
          <span>PROGRESS</span>
          {phase === "building" ? (
            <span className="font-mono text-black">{percent}%</span>
          ) : (
            <span className="text-black">Planning</span>
          )}
        </div>

        <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
          {phase === "building" ? (
            <div
              className="relative h-full overflow-hidden rounded-full bg-black transition-[width] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${percent}%` }}
            >
              <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] [animation:bar-sheen_1.3s_linear_infinite]" />
            </div>
          ) : (
            <div className="h-full w-[28%] rounded-full bg-black [animation:bar-idle_1.6s_cubic-bezier(0.16,1,0.3,1)_infinite_alternate]" />
          )}
        </div>

        <GenerationActivityPanel key={phase} phase={phase} />

        <div className="mt-5.5 text-[11px] font-semibold tracking-[0.04em] text-gray-400">
          {phase === "building" ? (
            <>
              PLANNED FILES ({doneCount}/{total})
            </>
          ) : (
            <span className="[animation:pulse_1.6s_ease-in-out_infinite]">
              DECIDING WHICH FILES TO CREATE…
            </span>
          )}
        </div>

        <div className="mt-2.5 max-h-65 overflow-y-auto text-left">
          {phase === "planning" ? (
            <FileSkeletonRows />
          ) : (
            <div className="rounded-md border border-gray-200 bg-white p-1.5">
              {plannedFiles.map((file, index) => {
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
