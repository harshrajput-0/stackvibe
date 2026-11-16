"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SaveChangesModal({
  isOpen,
  dirtyCount,
  isSaving,
  saveError,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,10,10,0.45)] p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-100 rounded-lg bg-white p-6.5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[17px] font-bold tracking-[-0.01em]">
              Save changes to project?
            </h3>
            <div className="mt-1.25 text-[13px] text-(--gray-500)">
              This updates{" "}
              {dirtyCount === 1 ? "the file" : `all ${dirtyCount} files`} on
              the server, so the change sticks around after a refresh.
              Preview already reflects it either way.
            </div>
          </div>
          <button
            className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-(--gray-500) hover:bg-(--gray-100) hover:text-(--black)"
            onClick={onClose}
            aria-label="Close"
            disabled={isSaving}
          >
            <X size={15} strokeWidth={1.6} />
          </button>
        </div>

        {saveError && (
          <div className="mt-3 text-[13px] text-red-600">{saveError}</div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" loading={isSaving} onClick={onConfirm}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
