"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { runGenerationSequence } from "@/app/api-client/generationService";
import { PLANNED_FILES } from "@/lib/constants";

// Owns all state for the "AI Agent is building..." sequence:
// progress percent, per-file status, and the resulting log messages.
// The actual timing/business logic lives in generationService.

export function useGeneration() {
  const [percent, setPercent] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [fileStatuses, setFileStatuses] = useState(() =>
    PLANNED_FILES.map(() => "pending"),
  );
  const [logEntries, setLogEntries] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const cancelRef = useRef(null);

  const start = useCallback((onComplete) => {
    cancelRef.current?.();

    setPercent(0);
    setDoneCount(0);
    setFileStatuses(PLANNED_FILES.map(() => "pending"));
    setLogEntries([]);
    setIsComplete(false);

    cancelRef.current = runGenerationSequence({
      onFileStart: (index) => {
        setFileStatuses((prev) => {
          const next = [...prev];
          next[index] = "active";
          return next;
        });
      },
      onFileComplete: (index, file, pct) => {
        setFileStatuses((prev) => {
          const next = [...prev];
          next[index] = "done";
          return next;
        });
        setDoneCount(index + 1);
        setPercent(pct);
        setLogEntries((prev) => [
          ...prev,
          { id: `file-${index}`, file: file.file },
        ]);
      },
      onComplete: () => {
        setIsComplete(true);
        onComplete?.();
      },
    });
  }, []);

  useEffect(() => () => cancelRef.current?.(), []);

  return {
    percent,
    doneCount,
    total: PLANNED_FILES.length,
    fileStatuses,
    logEntries,
    isComplete,
    start,
  };
}
