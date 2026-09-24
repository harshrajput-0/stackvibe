import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadProjectZip } from "@/lib/utils/downloadProjectZip";

function TabButton({ active, onClick, className = "", children }) {
  return (
    <button
      className={`h-7.5 rounded-[5px] px-3.5 text-[13px] font-medium transition-[background,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        active
          ? "bg-white! text-black shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          : "text-gray-500"
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Three-column layout: the project crumb and the actions each get their own
// flexible column, with Code | Preview centered between them — so the tabs
// stay dead-center regardless of how long the project name or action list
// is. Publish is a filled action button on the right rather than a tab,
// since publishing is something you do, not a view you look at.
//
// Below the `tablet` breakpoint the crumb and actions stay on one row
// (actions pinned right) and Code | Preview drop to a full-width second
// row, so nothing gets cramped on a narrow screen.
export function BuilderTopBar({
  projectName,
  mainView,
  onShowCode,
  onShowPreview,
  onPublish,
  files = {},
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const hasFiles = Object.keys(files).length > 0;

  async function handleDownload() {
    if (!hasFiles || isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadProjectZip(files, projectName);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div
      className="grid flex-none grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 border-b border-gray-200 bg-white px-4.5 py-3
        max-tablet:grid-cols-[minmax(0,1fr)_auto] max-tablet:gap-y-2.5"
    >
      {/* Project crumb: back link, product name, and the (possibly long)
          project name — truncated with an ellipsis, full name on hover. */}
      <div
        className="flex min-w-0 items-center gap-2.5 text-sm font-semibold max-tablet:[grid-area:1/1]"
      >
        <Link
          href="/dashboard"
          className="flex flex-none items-center text-gray-500 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-black"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={17} strokeWidth={1.8} />
        </Link>
        <span className="flex-none">StackVibe</span>
        <span className="flex-none font-normal text-gray-400">/</span>
        <span className="min-w-0 truncate" title={projectName}>
          {projectName}
        </span>
      </div>

      {/* Code | Preview — centered on desktop, full-width second row on
          small screens. Publish lives outside this group (see below). */}
      <div
        className="flex flex-none gap-0.5 rounded-sm bg-gray-100 p-0.75
          max-tablet:[grid-area:2/1/3/3] max-tablet:w-full"
      >
        <TabButton
          active={mainView === "code"}
          onClick={onShowCode}
          className="max-tablet:flex-1 max-tablet:text-center"
        >
          Code
        </TabButton>
        <TabButton
          active={mainView === "preview"}
          onClick={onShowPreview}
          className="max-tablet:flex-1 max-tablet:text-center"
        >
          Preview
        </TabButton>
      </div>

      {/* Download + Publish. Publish is the primary (filled) action —
          it's the thing you do here, not a tab. */}
      <div className="flex items-center justify-end gap-2 max-tablet:[grid-area:1/2]">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          disabled={!hasFiles || isDownloading}
          aria-label="Download project as zip"
        >
          {isDownloading ? (
            <Loader2 size={14} strokeWidth={2} className="animate-spin" />
          ) : (
            <Download size={14} strokeWidth={2} />
          )}
          Download
        </Button>
        <Button variant="primary" size="sm" onClick={onPublish}>
          Publish
        </Button>
      </div>
    </div>
  );
}
