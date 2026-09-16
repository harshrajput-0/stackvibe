"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Drag-to-resize width for a side panel (e.g. the chat sidebar).
// Width is clamped between `minWidth` (px) and `maxWidthRatio` * window
// width, so the panel can never be dragged past that share of the screen.
export function useResizablePanel({
  initialWidth = 320,
  minWidth = 260,
  maxWidthRatio = 0.3,
} = {}) {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(initialWidth);

  const clamp = useCallback(
    (value) => {
      const maxWidth =
        typeof window !== "undefined" ? window.innerWidth * maxWidthRatio : value;
      return Math.min(Math.max(value, minWidth), Math.max(maxWidth, minWidth));
    },
    [minWidth, maxWidthRatio],
  );

  const handleResizeMove = useCallback(
    (event) => {
      if (!isResizing.current) return;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const delta = clientX - startX.current;
      setWidth(clamp(startWidth.current + delta));
    },
    [clamp],
  );

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const startResizing = useCallback(
    (event) => {
      isResizing.current = true;
      startX.current = event.touches ? event.touches[0].clientX : event.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      event.preventDefault();
    },
    [width],
  );

  // Re-clamp on window resize so the panel never ends up over 30% of a
  // newly-shrunk viewport.
  useEffect(() => {
    function handleWindowResize() {
      setWidth((current) => clamp(current));
    }
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [clamp]);

  useEffect(() => {
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", stopResizing);
    window.addEventListener("touchmove", handleResizeMove);
    window.addEventListener("touchend", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("touchmove", handleResizeMove);
      window.removeEventListener("touchend", stopResizing);
    };
  }, [handleResizeMove, stopResizing]);

  return { width, startResizing };
}