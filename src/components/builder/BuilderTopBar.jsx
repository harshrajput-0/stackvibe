import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadProjectZip } from "@/lib/utils/downloadProjectZip";

function TabButton({ active, onClick, children }) {
  return (
    <button
      className={`h-7.5 rounded-[5px] px-3.5 text-[13px] font-medium transition-[background,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        active
          ? "bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          : "text-gray-500"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function BuilderTopBar({
  projectName,
  mainView,
  onShowCode,
  onShowPreview,
  onOpenPublish,
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
    <div className="flex h-14 flex-none items-center justify-between border-b border-gray-200 bg-white px-4.5">
      <div className="flex items-center gap-2.5 text-sm font-semibold">
        <Link
          href="/dashboard"
          className="flex items-center text-gray-500 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-black"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={17} strokeWidth={1.8} />
        </Link>
        <span>StackVibe</span>
        <span className="font-normal text-gray-400">/</span>
        <span>{projectName}</span>
      </div>

      <div className="flex gap-0.5 rounded-sm bg-gray-100 p-0.75">
        <TabButton active={mainView === "code"} onClick={onShowCode}>
          Code
        </TabButton>
        <TabButton active={mainView === "preview"} onClick={onShowPreview}>
          Preview
        </TabButton>
        <TabButton onClick={onOpenPublish}>Publish</TabButton>
      </div>

      <div className="flex items-center gap-2">
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
        <Button variant="secondary" size="sm" onClick={onPublish}>
          Share
        </Button>
      </div>
    </div>
  );
}