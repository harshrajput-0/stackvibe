"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal — the one dialog shell used everywhere (publish, edit project,
 * delete confirmation, …). Renders nothing while closed, so any state
 * held by `children` resets every time it opens.
 *
 * - Esc, the close button and a click on the backdrop call `onClose`
 * - `dismissible={false}` disables all three (e.g. while saving)
 * - focus moves into the dialog, is trapped, and returns to where it was
 *
 * Usage:
 * <Modal open={open} onClose={close} title="Publish your site" description="…">
 *   …body…
 * </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  className,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cardRef = useRef(null);

  // Focus management + scroll lock, only while open.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const card = cardRef.current;
    if (card && !card.contains(document.activeElement)) {
      // Prefer an explicit [data-autofocus] field, then the first control
      // that isn't the close button, then the close button itself.
      const target =
        card.querySelector("[data-autofocus]") ||
        card.querySelector(
          FOCUSABLE.split(", ")
            .map((selector) => `${selector}:not([data-modal-close])`)
            .join(", "),
        ) ||
        card.querySelector(FOCUSABLE) ||
        card;
      target.focus();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open || !dismissible) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  // Keep Tab / Shift+Tab inside the dialog.
  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const focusable = cardRef.current?.querySelectorAll(FOCUSABLE);
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex animate-fade-in items-center justify-center bg-[rgba(10,10,10,0.45)] p-5"
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={trapFocus}
        className={cn(
          "max-h-[calc(100dvh-40px)] w-full max-w-105 animate-pop-in overflow-x-hidden overflow-y-auto rounded-md bg-white p-6.5 outline-none",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id={titleId}
              className="text-[17px] font-bold tracking-[-0.01em]"
            >
              {title}
            </h3>
            {description && (
              <p
                id={descriptionId}
                className="mt-1.25 text-[13px] text-(--gray-500)"
              >
                {description}
              </p>
            )}
          </div>
          <Button
            variant="iconGhost"
            size="iconSm"
            aria-label="Close"
            data-modal-close
            onClick={onClose}
            disabled={!dismissible}
            className="-mt-0.5 -mr-1.5"
          >
            <X size={15} strokeWidth={1.6} />
          </Button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}