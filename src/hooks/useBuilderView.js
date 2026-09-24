"use client";

import { useCallback, useState } from "react";

// Builder screen's view state:
// - mainView: shows ("generating" | "limit" | "failed" | "preview" | "code")
//   "limit" and "failed" are generation outcomes: the AI's rate limit was
//   hit partway through, or the run finished but one or more files fell
//   back to a placeholder.
// - sideTab: option ("chat" | "files")

export function useBuilderView(initialMainView = "generating") {
  const [mainView, setMainView] = useState(initialMainView);
  const [sideTab, setSideTab] = useState("chat");

  const showGenerating = useCallback(() => setMainView("generating"), []);
  const showLimit = useCallback(() => setMainView("limit"), []);
  const showFailed = useCallback(() => setMainView("failed"), []);
  const showPreview = useCallback(() => setMainView("preview"), []);
  const showCode = useCallback(() => setMainView("code"), []);

  return {
    mainView,
    sideTab,
    setSideTab,
    showGenerating,
    showLimit,
    showFailed,
    showPreview,
    showCode,
  };
}
