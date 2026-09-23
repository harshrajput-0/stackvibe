"use client";

import { useMemo } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  useSandpackPreviewProgress,
} from "@codesandbox/sandpack-react";
import { Loader2 } from "lucide-react";
import {
  PREVIEW_ENTRY_CODE,
  PREVIEW_INDEX_HTML,
} from "@/lib/generation/previewTemplate";


const EXTERNAL_RESOURCES = [
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
];

// Overlay shown on top of the site while Sandpack's bundler is
// downloading dependencies / building. Must render inside SandpackProvider.
function SandboxLoadingOverlay() {
  const progressMessage = useSandpackPreviewProgress();

  // Nothing is loading, so show nothing.
  if (!progressMessage) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-white/90 backdrop-blur-sm">
      <Loader2 size={20} strokeWidth={2} className="animate-spin text-gray-400" />
      <span className="text-[11.5px] text-gray-400">{progressMessage}</span>
    </div>
  );
}


export function SiteSandbox({ files, showRefreshButton = true }) {

  const sandpackFiles = useMemo(() => {
    // Sandpack's React template uses /src/index.js as its entry point.
    const entries = {
      "/public/index.html": PREVIEW_INDEX_HTML,
      "/src/index.js": PREVIEW_ENTRY_CODE,
    };

    // Move generated files into /src folder
    for (const [path, content] of Object.entries(files)) {
      entries[`/src${path}`] = content;
    }
    return entries;
  }, [files]);

  return (
    <SandpackProvider
      template="react"
      files={sandpackFiles}
      customSetup={{ entry: "/src/index.js" }}
      options={{ externalResources: EXTERNAL_RESOURCES }}
      style={{ height: "100%", flex: 1, minHeight: 0 }}
    >
      {/* Renders the generated website, with a loading overlay while it bundles. */}
      <div className="relative h-full">
        <SandpackPreview
          showNavigator={false}
          showOpenInCodeSandbox={false}
          showRefreshButton={showRefreshButton}
          style={{ height: "100%" }}
        />
        <SandboxLoadingOverlay />
      </div>
    </SandpackProvider>
  );
}