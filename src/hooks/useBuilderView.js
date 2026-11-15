"use client";

import { useCallback, useState } from "react";

// Builder view state:
// - mainView: "generating" | "limit" | "generation-error" | "failed" | "preview" | "code"
//   "limit" means generation hit an AI rate limit (partial progress saved).
//   "generation-error" means generation failed outright, before anything
//   was produced (no planned files at all) — otherwise identical to "limit"
//   in that Resume can retry it.
//   "failed" means some files fell back to placeholders.
// - sideTab: "chat" | "files"

export function useBuilderView(initialMainView = "generating") {
  const [mainView, setMainView] = useState(initialMainView);
  const [sideTab, setSideTab] = useState("chat");

  const showGenerating = useCallback(() => setMainView("generating"), []);
  const showLimit = useCallback(() => setMainView("limit"), []);
  const showGenerationError = useCallback(
    () => setMainView("generation-error"),
    [],
  );
  const showFailed = useCallback(() => setMainView("failed"), []);
  const showPreview = useCallback(() => setMainView("preview"), []);
  const showCode = useCallback(() => setMainView("code"), []);

  return {
    mainView,
    sideTab,
    setSideTab,
    showGenerating,
    showLimit,
    showGenerationError,
    showFailed,
    showPreview,
    showCode,
  };
}
