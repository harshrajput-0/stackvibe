"use client";

import { useCallback, useRef, useState } from "react";
import {
  pollProjectGeneration,
  resumeProjectGeneration,
} from "@/api-client/generationService";

// Owns all state for the "AI Agent is building..." sequence by polling the
// real project record (by slug) while the server-side generation job runs,
// rather than simulating progress with timers.

export function useGeneration() {
  const [plannedFiles, setPlannedFiles] = useState([]);
  const [filesGenerated, setFilesGenerated] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLimited, setIsLimited] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);
  const slugRef = useRef(null);
  const onCompleteRef = useRef(null);

  // Starts monitoring the generation process for a project.
  const start = useCallback((slug, onComplete) => {
    // If another polling process is already running, stop it first.
    cancelRef.current?.();

    slugRef.current = slug;
    onCompleteRef.current = onComplete;

    // Reset all previous generation data.
    setPlannedFiles([]);
    setFilesGenerated([]);
    setCurrentFile(null);
    setIsComplete(false);
    setIsLimited(false);
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

      // Run when the AI's rate limit stops generation partway through.
      // Progress made so far is already saved server-side.
      onLimit: (project) => {
        setPlannedFiles(project.filesPlanned || []);
        setFilesGenerated(project.filesGenerated || []);
        setCurrentFile(null);
        setIsLimited(true);
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

  // Ask the backend to continue a generation that stopped on the AI limit,
  // then go back to polling the same as a fresh build.
  const resume = useCallback(async () => {
    const slug = slugRef.current;
    if (!slug || isResuming) return;

    setIsResuming(true);
    try {
      await resumeProjectGeneration(slug);
      start(slug, onCompleteRef.current);
    } catch (err) {
      setError(err.message || "Failed to resume generation");
    } finally {
      setIsResuming(false);
    }
  }, [isResuming, start]);

  const total = plannedFiles.length;
  const doneCount = filesGenerated.length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;              // Calculate the generation progress percentage
  const pendingCount = Math.max(total - doneCount, 0);

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
    pendingCount,
    fileStatuses,
    isComplete,
    isLimited,
    isResuming,
    error,
    start,
    stop,
    resume,
  };
}
