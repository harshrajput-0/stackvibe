"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";
import {
  BUILD_MESSAGES,
  MESSAGE_ROTATE_MS,
  PLANNING_MESSAGES,
  SLOW_GENERATION_NOTE_MS,
} from "@/lib/constants";

// Keeps the "AI Agent is building…" panel feeling alive during a long wait:
// rotates through a small set of friendly status lines and, after a while,
// surfaces a note that free models can be slow. Purely cosmetic — it never
// reads real progress, so it works the same whether the server is on file
// 1 or file 6.
//
// phase: "planning" | "building" | null (null while idle/error — nothing rotates)
export function useGenerationMessages(phase) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [showSlowNote, setShowSlowNote] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(0);
    setShowSlowNote(false);
    if (!phase) return undefined;

    // Reduced motion: keep the first message steady instead of cycling —
    // the slow note (informational, not decorative) still appears on time.
    const rotateId = reducedMotion
      ? null
      : setInterval(() => setIndex((i) => i + 1), MESSAGE_ROTATE_MS);

    const slowId = setTimeout(
      () => setShowSlowNote(true),
      SLOW_GENERATION_NOTE_MS,
    );

    return () => {
      if (rotateId) clearInterval(rotateId);
      clearTimeout(slowId);
    };
  }, [phase, reducedMotion]);

  const messages = phase === "planning" ? PLANNING_MESSAGES : BUILD_MESSAGES;

  return {
    message: messages[index % messages.length],
    showSlowNote,
    reducedMotion,
  };
}
