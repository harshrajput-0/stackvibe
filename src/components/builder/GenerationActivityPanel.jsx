"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Friendly, rotating status lines for each phase. These are purely
// cosmetic — they don't track real progress — so a long wait still feels
// active instead of stalled.
const PLANNING_MESSAGES = [
  "Reading your idea",
  "Planning the structure",
  "Deciding which files you need",
  "Still planning, almost there",
];

const BUILDING_MESSAGES = [
  "Sketching the layout",
  "Choosing colors and type",
  "Wiring up components",
  "Polishing the details",
  "Still working on it",
];

const MESSAGE_INTERVAL_MS = 3200;
const SLOW_NOTE_DELAY_MS = 14000;

// A calm, never-ending wave of blocks plus a rotating status line. Neither
// is tied to real timing — they just keep the "AI is working" card from
// feeling frozen during a long wait.
export function GenerationActivityPanel({ phase }) {
  const reducedMotion = useReducedMotion();
  const messages = phase === "planning" ? PLANNING_MESSAGES : BUILDING_MESSAGES;
  const [messageIndex, setMessageIndex] = useState(0);
  const [showSlowNote, setShowSlowNote] = useState(false);

  // Restart the rotation/slow-note timers on mount. The parent remounts
  // this component (via a `key={phase}` change) when moving from planning
  // to building, so a fresh timer set starts automatically — no manual
  // state reset needed here.
  useEffect(() => {
    if (reducedMotion) return;

    const rotate = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, MESSAGE_INTERVAL_MS);

    const slow = setTimeout(() => setShowSlowNote(true), SLOW_NOTE_DELAY_MS);

    return () => {
      clearInterval(rotate);
      clearTimeout(slow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div className="mt-5 rounded-lg border border-gray-200 bg-gray-100 p-3.5 pb-3">
      <div className="grid grid-cols-[repeat(20,1fr)] gap-1" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="aspect-square animate-[wave_2.4s_ease-in-out_infinite] rounded-[2px] bg-black opacity-10"
            style={{ animationDelay: `${(i * 0.11).toFixed(2)}s` }}
          />
        ))}
      </div>

      <div className="relative mt-3.5 h-[19px] text-[13px] font-medium">
        {messages.map((message, i) => (
          <span
            key={message}
            className={`absolute inset-x-0 top-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              i === messageIndex
                ? "translate-y-0 opacity-100"
                : "translate-y-1.5 opacity-0"
            }`}
          >
            {message}
          </span>
        ))}
      </div>

      <p
        className={`mt-1 h-4 text-xs text-gray-500 transition-opacity duration-500 ${
          showSlowNote ? "opacity-100" : "opacity-0"
        }`}
      >
        Free models can be slow at busy times. Your project is still being
        built.
      </p>
    </div>
  );
}
