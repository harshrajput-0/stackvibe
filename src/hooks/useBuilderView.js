"use client";

import { useCallback, useState } from "react";

// Builder view state:
// - mainView: "generating" | "limit" | "failed" | "preview" | "code"
//   "limit" means generation hit an AI rate limit.
//   "failed" means some files fell back to placeholders.
// - sideTab: "chat" | "files"

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
