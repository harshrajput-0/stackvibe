"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublishModal({
  isOpen,
  onClose,
  publishUrl,
  isPublished,
  isPublishing,
  publishError,
  onPublish,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publishUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (e.g. permissions); the URL is still visible to copy manually.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,10,10,0.45)] p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-105 rounded-lg bg-white p-6.5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[17px] font-bold tracking-[-0.01em]">
              Publish your site
            </h3>
            <div className="mt-1.25 text-[13px] text-(--gray-500)">
              {isPublished
                ? "Your site is live at this address."
                : "Your changes will go live at this address."}
            </div>
          </div>
          <button
            className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-(--gray-500) hover:bg-(--gray-100) hover:text-(--black)"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={15} strokeWidth={1.6} />
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <div className="flex h-10 flex-1 items-center overflow-hidden rounded-sm border border-(--gray-300) px-3 font-mono text-[12.5px] text-ellipsis whitespace-nowrap text-(--gray-700)">
            {publishUrl}
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {publishError && (
          <div className="mt-3 text-[13px] text-red-600">{publishError}</div>
        )}

        <Button
          variant="primary"
          block
          className="mt-5"
          loading={isPublishing}
          onClick={onPublish}
        >
          {isPublished ? "Republish" : "Publish"}
        </Button>
      </div>
    </div>
  );
}