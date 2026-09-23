"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

const VIEWPORT_MARGIN = 8;

const PopoverContext = createContext({ close: () => {} });

/** Lets content inside a <Popover> close it: `const { close } = usePopover()`. */
export const usePopover = () => useContext(PopoverContext);

/**
 * Popover — a floating panel anchored to a trigger. This is the single
 * primitive behind every dropdown / menu / popover in the app.
 *
 * The panel is portalled to <body> and positioned with `position: fixed`, so
 * it is never clipped by an `overflow-hidden` parent (like a project card).
 * It flips above the trigger when there is no room below, stays inside the
 * viewport, and closes on outside click, Esc, Tab, and item selection.
 *
 * `trigger` receives the props that belong on the trigger element:
 *   <Popover trigger={(props) => <Button {...props}>Open</Button>}>
 *
 * Content inside the panel can close it with `usePopover().close()`.
 */
export function Popover({
  trigger,
  children,
  align = "end",
  offset = 6,
  panelClassName,
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      anchorRef.current
        ?.querySelector("button, a, [tabindex]")
        ?.focus({ preventScroll: true });
    }
  }, []);

  // Place the panel next to the trigger. Writes styles straight to the DOM
  // node so scrolling/resizing doesn't cause React re-renders.
  const position = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const rect = anchor.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = panel;

    let top = rect.bottom + offset;
    const fitsBelow = top + height <= window.innerHeight - VIEWPORT_MARGIN;
    const fitsAbove = rect.top - offset - height >= VIEWPORT_MARGIN;
    if (!fitsBelow && fitsAbove) top = rect.top - offset - height;

    let left = align === "end" ? rect.right - width : rect.left;
    left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(left, window.innerWidth - width - VIEWPORT_MARGIN),
    );

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }, [align, offset]);

  useLayoutEffect(() => {
    if (open) position();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (
        panelRef.current?.contains(event.target) ||
        anchorRef.current?.contains(event.target)
      ) {
        return;
      }
      close(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") close(true);
      else if (event.key === "Tab") close(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, close, position]);

  const triggerProps = {
    onClick: () => setOpen((current) => !current),
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? panelId : undefined,
  };

  return (
    <>
      <span ref={anchorRef} className="inline-flex">
        {trigger(triggerProps)}
      </span>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className={cn(
              "fixed z-70 animate-pop-in",
              align === "end" ? "origin-top-right" : "origin-top-left",
              panelClassName,
            )}
          >
            <PopoverContext.Provider value={{ close }}>
              {children}
            </PopoverContext.Provider>
          </div>,
          document.body,
        )}
    </>
  );
}
