"use client";

import { useCallback, useState } from "react";

// Builder screen's view state:
// - mainView: shows ("generating" | "preview" | "code")
// - sideTab: option ("chat" | "files")

export function useBuilderView(initialMainView = "generating") {
  const [mainView, setMainView] = useState(initialMainView);
  const [sideTab, setSideTab] = useState("chat");

  const showGenerating = useCallback(() => setMainView("generating"), []);
  const showPreview = useCallback(() => setMainView("preview"), []);
  const showCode = useCallback(() => setMainView("code"), []);

  return {
    mainView,
    sideTab,
    setSideTab,
    showGenerating,
    showPreview,
    showCode,
  };
}
