import { Check, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Shown when some files failed all retry rounds and were replaced with
// placeholders. Shows "Built N of M files" and allows each file to be retried.
export function FileFailedView({
  plannedFiles = [],
  filesFailed = [],
  retryingPath,
  isRetryingAll,
  onRetryFile,
  onRetryAllFailed,
  onOpenPreview,
}) {
  const failedSet = new Set(filesFailed);
  const total = plannedFiles.length;
  const builtCount = total - failedSet.size;

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6.5">
      <div className="w-full max-w-115 rounded-lg border border-gray-200 bg-white p-[28px_26px] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex h-9.5 w-9.5 items-center justify-center rounded-[10px] border border-gray-200">
          <TriangleAlert size={18} strokeWidth={1.8} color="#0A0A0A" />
        </div>

        <h3 className="text-[17px] font-bold tracking-[-0.01em]">
          Built {builtCount} of {total} files
        </h3>
        <p className="mt-1.25 text-[13px] text-gray-500">
          {failedSet.size === 1
            ? "One file couldn't be generated."
            : `${failedSet.size} files couldn't be generated.`}{" "}
          The site still works, with a placeholder in its place.
        </p>

        <div className="mt-4 rounded-md border border-gray-200 bg-white p-1.5">
          {plannedFiles.map((file) => {
            const failed = failedSet.has(file.path);
            const retrying = retryingPath === file.path;

            return (
              <div
                className="flex items-start gap-2.5 rounded-md border-t border-t-gray-100 px-2.5 py-2.25 first:border-t-0"
                key={file.path}
              >
                <span className="mt-px flex h-3.75 w-3.75 flex-none items-center justify-center">
                  {retrying ? (
                    <Loader2
                      size={13}
                      strokeWidth={2}
                      className="animate-spin text-gray-400"
                    />
                  ) : failed ? (
                    <TriangleAlert size={14} strokeWidth={2} color="#0A0A0A" />
                  ) : (
                    <Check size={13} strokeWidth={1.8} color="#0A0A0A" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs text-black">
                    {file.path}
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-[11.5px] leading-[1.4] text-gray-500">
                    {failed
                      ? "Couldn't be generated. Using a placeholder."
                      : file.description}
                  </div>
                </div>
                {failed && (
                  <button
                    type="button"
                    onClick={() => onRetryFile(file.path)}
                    disabled={Boolean(retryingPath) || isRetryingAll}
                    className="flex-none rounded-md border border-gray-300 px-2 py-1 text-[11px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {retrying ? "Retrying…" : "Retry"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5.5 flex flex-wrap gap-2">
          {failedSet.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRetryAllFailed}
              loading={isRetryingAll}
              disabled={Boolean(retryingPath)}
            >
              {failedSet.size === 1
                ? "Retry failed file"
                : "Retry failed files"}
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onOpenPreview}>
            Open preview
          </Button>
        </div>
      </div>
    </div>
  );
}
