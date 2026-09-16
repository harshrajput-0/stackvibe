"use client";

import { useCallback, useRef, useState } from "react";
import { pollProjectGeneration } from "@/api-client/generationService";

// Owns all state for the "AI Agent is building..." sequence by polling the
// real project record (by slug) while the server-side generation job runs,
// rather than simulating progress with timers.

export function useGeneration() {
  const [plannedFiles, setPlannedFiles] = useState([]);
  const [filesGenerated, setFilesGenerated] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);

  // Starts monitoring the generation process for a project.
  const start = useCallback((slug, onComplete) => {
    // If another polling process is already running, stop it first.
    cancelRef.current?.();

    // Reset all previous generation data.
    setPlannedFiles([]);
    setFilesGenerated([]);
    setCurrentFile(null);
    setIsComplete(false);
    setError(null);

    // Get project's latest status from backend
    cancelRef.current = pollProjectGeneration(slug, {
      // Runs whenever fresh project data is received.
      onUpdate: (project) => {
        setPlannedFiles(project.filesPlanned || []);
        setFilesGenerated(project.filesGenerated || []);
        setCurrentFile(project.currentFile || null);
      },

      // Run when generation is finished
      onComplete: (project) => {
        setPlannedFiles(project.filesPlanned || []);
        setFilesGenerated(project.filesGenerated || []);
        setCurrentFile(null);
        setIsComplete(true);
        onComplete?.(project);
      },

      // Run when error occured
      onError: (err) => {
        setError(err.message || "Generation failed");
      },
    });
  }, []);

  // Stop current generation
  const stop = useCallback(() => {
    cancelRef.current?.();
  }, []);

  const total = plannedFiles.length;
  const doneCount = filesGenerated.length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;              // Calculate the generation progress percentage

  // Create a status for every planned file
  const fileStatuses = plannedFiles.map((file) => {
    if (filesGenerated.includes(file.path)) return "done";
    if (currentFile === file.path) return "active";
    return "pending";
  });

  return {
    plannedFiles,
    percent,
    doneCount,
    total,
    fileStatuses,
    isComplete,
    error,
    start,
    stop,
  };
}
